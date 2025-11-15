import { getBedrockClient } from "./bedrock-client";
import { SYSTEM_PROMPTS, PROMPT_TEMPLATES } from "./prompts";
import type { ArgumentQuality, LogicalFallacy } from "@arena/shared";

export class ArgumentQualityService {
  private client = getBedrockClient();

  async analyzeArgument(
    argument: string,
    position: string
  ): Promise<ArgumentQuality & { feedback: string }> {
    try {
      const result = await this.client.generateStructuredOutput<
        ArgumentQuality & { feedback: string }
      >(
        PROMPT_TEMPLATES.analyzeArgument(argument, position),
        SYSTEM_PROMPTS.ARGUMENT_ANALYZER,
        JSON.stringify({
          structure: "number",
          clarity: "number",
          evidence: "number",
          reasoning: "number",
          overall: "number",
          feedback: "string",
        })
      );

      return result;
    } catch (error) {
      console.error("Argument analysis failed:", error);
      return {
        structure: 50,
        clarity: 50,
        evidence: 50,
        reasoning: 50,
        overall: 50,
        feedback: "Unable to analyze argument at this time.",
      };
    }
  }

  async detectFallacies(argument: string): Promise<{
    fallacies: LogicalFallacy[];
    hasFallacies: boolean;
  }> {
    try {
      const result = await this.client.generateStructuredOutput<{
        fallacies: Array<{
          type: string;
          description: string;
          severity: "low" | "medium" | "high";
          explanation: string;
        }>;
        hasFallacies: boolean;
      }>(
        PROMPT_TEMPLATES.detectFallacies(argument),
        SYSTEM_PROMPTS.FALLACY_DETECTOR,
        JSON.stringify({
          fallacies: [
            {
              type: "string",
              description: "string",
              severity: "string",
              explanation: "string",
            },
          ],
          hasFallacies: "boolean",
        })
      );

      // Transform to proper LogicalFallacy format
      const fallacies: LogicalFallacy[] = result.fallacies.map((f, index) => ({
        type: f.type,
        description: f.description,
        location: {
          start: 0, // Would need more sophisticated text analysis
          end: argument.length,
        },
        severity: f.severity,
      }));

      return {
        fallacies,
        hasFallacies: result.hasFallacies,
      };
    } catch (error) {
      console.error("Fallacy detection failed:", error);
      return {
        fallacies: [],
        hasFallacies: false,
      };
    }
  }

  async suggestImprovements(
    argument: string,
    qualityAnalysis: ArgumentQuality
  ): Promise<string[]> {
    const suggestions: string[] = [];

    if (qualityAnalysis.structure < 60) {
      suggestions.push(
        "Consider organizing your argument with a clear claim, supporting points, and conclusion."
      );
    }

    if (qualityAnalysis.clarity < 60) {
      suggestions.push(
        "Try to be more concise and direct. Avoid unnecessary jargon or complex sentence structures."
      );
    }

    if (qualityAnalysis.evidence < 60) {
      suggestions.push(
        "Strengthen your argument with specific evidence, data, or credible sources."
      );
    }

    if (qualityAnalysis.reasoning < 60) {
      suggestions.push(
        "Make the logical connections between your claim and evidence more explicit."
      );
    }

    return suggestions;
  }

  async compareArguments(
    argument1: string,
    argument2: string
  ): Promise<{
    stronger: "argument1" | "argument2" | "tie";
    analysis: {
      argument1: ArgumentQuality;
      argument2: ArgumentQuality;
    };
    explanation: string;
  }> {
    const [analysis1, analysis2] = await Promise.all([
      this.analyzeArgument(argument1, "Position A"),
      this.analyzeArgument(argument2, "Position B"),
    ]);

    const diff = analysis1.overall - analysis2.overall;
    let stronger: "argument1" | "argument2" | "tie";

    if (Math.abs(diff) < 5) {
      stronger = "tie";
    } else if (diff > 0) {
      stronger = "argument1";
    } else {
      stronger = "argument2";
    }

    let explanation = "";
    if (stronger === "tie") {
      explanation = "Both arguments are roughly equivalent in quality.";
    } else {
      const winner = stronger === "argument1" ? analysis1 : analysis2;
      const loser = stronger === "argument1" ? analysis2 : analysis1;

      explanation = `Argument ${stronger === "argument1" ? "1" : "2"} is stronger primarily due to `;

      const advantages: string[] = [];
      if (winner.structure > loser.structure + 10) advantages.push("better structure");
      if (winner.clarity > loser.clarity + 10) advantages.push("greater clarity");
      if (winner.evidence > loser.evidence + 10) advantages.push("stronger evidence");
      if (winner.reasoning > loser.reasoning + 10) advantages.push("more sound reasoning");

      explanation += advantages.join(", ") + ".";
    }

    return {
      stronger,
      analysis: {
        argument1: analysis1,
        argument2: analysis2,
      },
      explanation,
    };
  }
}
