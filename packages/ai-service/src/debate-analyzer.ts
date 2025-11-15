import { getBedrockClient } from "./bedrock-client";
import { SYSTEM_PROMPTS, PROMPT_TEMPLATES } from "./prompts";
import type { DebateAnalysis } from "@arena/shared";
import { ArgumentQualityService } from "./argument-quality";
import { FactCheckerService } from "./fact-checker";

export interface DebateParticipantData {
  userId: string;
  username: string;
  position: string;
  arguments: Array<{
    id: string;
    content: string;
    turnNumber: number;
    sources?: Array<{ url: string; title?: string }>;
  }>;
}

export class DebateAnalyzerService {
  private client = getBedrockClient();
  private argumentQuality = new ArgumentQualityService();
  private factChecker = new FactCheckerService();

  async analyzeDebate(
    topic: string,
    participant1: DebateParticipantData,
    participant2: DebateParticipantData
  ): Promise<DebateAnalysis> {
    try {
      // Get AI judgment
      const judgment = await this.client.generateStructuredOutput<{
        winner: { participant: string; confidence: number };
        scores: Record<
          string,
          {
            argumentStructure: number;
            evidenceQuality: number;
            rhetoricEffectiveness: number;
            logicalConsistency: number;
            overall: number;
          }
        >;
        summary: string;
        commonGround: string[];
        keyDisagreements: string[];
        highlights: Array<{
          participant: string;
          description: string;
          type: string;
        }>;
        suggestions: Record<string, string>;
      }>(
        PROMPT_TEMPLATES.judgeDebate(
          topic,
          {
            name: participant1.username,
            position: participant1.position,
            arguments: participant1.arguments.map((a) => a.content),
          },
          {
            name: participant2.username,
            position: participant2.position,
            arguments: participant2.arguments.map((a) => a.content),
          }
        ),
        SYSTEM_PROMPTS.DEBATE_JUDGE,
        JSON.stringify({
          winner: { participant: "string", confidence: "number" },
          scores: {},
          summary: "string",
          commonGround: ["string"],
          keyDisagreements: ["string"],
          highlights: [],
          suggestions: {},
        }),
        { maxTokens: 4096 }
      );

      // Determine winner userId
      const winnerUsername = judgment.winner.participant;
      const winnerId =
        winnerUsername === participant1.username ? participant1.userId : participant2.userId;

      // Convert highlights to proper format
      const highlights = judgment.highlights.map((h) => ({
        timestamp: new Date(), // Would need actual timestamps from arguments
        description: h.description,
        type: h.type as "strong_argument" | "fallacy" | "mind_change" | "common_ground",
      }));

      return {
        winner: {
          userId: winnerId,
          confidence: judgment.winner.confidence,
        },
        scores: {
          [participant1.userId]: judgment.scores[participant1.username],
          [participant2.userId]: judgment.scores[participant2.username],
        },
        commonGround: judgment.commonGround,
        keyDisagreements: judgment.keyDisagreements,
        highlights,
        suggestions: [
          judgment.suggestions[participant1.username],
          judgment.suggestions[participant2.username],
        ],
      };
    } catch (error) {
      console.error("Debate analysis failed:", error);
      throw new Error("Failed to analyze debate");
    }
  }

  async generateNeutralBriefing(topic: string): Promise<string> {
    try {
      const briefing = await this.client.generateText(
        PROMPT_TEMPLATES.generateBriefing(topic),
        SYSTEM_PROMPTS.NEUTRAL_BRIEFING,
        { maxTokens: 2048 }
      );

      return briefing;
    } catch (error) {
      console.error("Briefing generation failed:", error);
      return `Unable to generate briefing for topic: ${topic}`;
    }
  }

  async suggestArguments(
    topic: string,
    position: string,
    context?: string
  ): Promise<
    Array<{
      mainPoint: string;
      explanation: string;
      evidence: string;
      counterarguments: string[];
    }>
  > {
    try {
      const result = await this.client.generateStructuredOutput<{
        arguments: Array<{
          mainPoint: string;
          explanation: string;
          evidence: string;
          counterarguments: string[];
        }>;
      }>(
        PROMPT_TEMPLATES.suggestArguments(topic, position, context),
        SYSTEM_PROMPTS.NEUTRAL_BRIEFING,
        JSON.stringify({
          arguments: [
            {
              mainPoint: "string",
              explanation: "string",
              evidence: "string",
              counterarguments: ["string"],
            },
          ],
        })
      );

      return result.arguments;
    } catch (error) {
      console.error("Argument suggestion failed:", error);
      return [];
    }
  }

  async findCommonGround(
    participant1Arguments: string[],
    participant2Arguments: string[]
  ): Promise<{
    commonGround: string[];
    sharedValues: string[];
    compromisePotential: string[];
    summary: string;
  }> {
    try {
      const result = await this.client.generateStructuredOutput<{
        commonGround: string[];
        sharedValues: string[];
        compromisePotential: string[];
        summary: string;
      }>(
        PROMPT_TEMPLATES.findCommonGround(participant1Arguments, participant2Arguments),
        SYSTEM_PROMPTS.COMMON_GROUND_FINDER,
        JSON.stringify({
          commonGround: ["string"],
          sharedValues: ["string"],
          compromisePotential: ["string"],
          summary: "string",
        })
      );

      return result;
    } catch (error) {
      console.error("Common ground finding failed:", error);
      return {
        commonGround: [],
        sharedValues: [],
        compromisePotential: [],
        summary: "Unable to identify common ground at this time.",
      };
    }
  }

  async generateHighlights(
    arguments: Array<{ content: string; userId: string; turnNumber: number }>
  ): Promise<
    Array<{
      argumentId: number;
      title: string;
      description: string;
      type: "strong_argument" | "turning_point" | "fact_check" | "fallacy";
    }>
  > {
    // Analyze each argument for quality
    const analyzed = await Promise.all(
      arguments.map(async (arg, index) => {
        const quality = await this.argumentQuality.analyzeArgument(arg.content, "Position");
        const fallacies = await this.argumentQuality.detectFallacies(arg.content);

        return {
          index,
          quality,
          fallacies,
          ...arg,
        };
      })
    );

    const highlights: Array<{
      argumentId: number;
      title: string;
      description: string;
      type: "strong_argument" | "turning_point" | "fact_check" | "fallacy";
    }> = [];

    // Find strongest arguments
    const topArguments = analyzed
      .filter((a) => a.quality.overall >= 80)
      .sort((a, b) => b.quality.overall - a.quality.overall)
      .slice(0, 3);

    for (const arg of topArguments) {
      highlights.push({
        argumentId: arg.index,
        title: "Strong Argument",
        description: `Exceptional argument with ${arg.quality.overall}/100 quality score`,
        type: "strong_argument",
      });
    }

    // Find notable fallacies
    for (const arg of analyzed) {
      if (arg.fallacies.hasFallacies) {
        const severeFallacy = arg.fallacies.fallacies.find((f) => f.severity === "high");
        if (severeFallacy) {
          highlights.push({
            argumentId: arg.index,
            title: "Logical Fallacy Detected",
            description: `${severeFallacy.type}: ${severeFallacy.description}`,
            type: "fallacy",
          });
        }
      }
    }

    return highlights.slice(0, 5); // Return top 5 highlights
  }
}
