import { getBedrockClient } from "./bedrock-client";
import { SYSTEM_PROMPTS, PROMPT_TEMPLATES } from "./prompts";
import type { ToxicityAnalysis } from "@arena/shared";

export class ModerationService {
  private client = getBedrockClient();

  async checkToxicity(text: string): Promise<ToxicityAnalysis> {
    try {
      const result = await this.client.generateStructuredOutput<ToxicityAnalysis>(
        PROMPT_TEMPLATES.checkToxicity(text),
        SYSTEM_PROMPTS.TOXICITY_MODERATOR,
        JSON.stringify({
          score: "number",
          categories: {
            hate: "number",
            harassment: "number",
            violence: "number",
            sexual: "number",
            selfHarm: "number",
          },
          isToxic: "boolean",
          explanation: "string",
        })
      );

      return result;
    } catch (error) {
      console.error("Toxicity check failed:", error);
      // Return safe default on error
      return {
        score: 0,
        categories: {
          hate: 0,
          harassment: 0,
          selfHarm: 0,
          sexual: 0,
          violence: 0,
        },
        isToxic: false,
      };
    }
  }

  async detectBotBehavior(
    userHistory: Array<{
      content: string;
      timestamp: Date;
    }>
  ): Promise<{
    isSuspicious: boolean;
    confidence: number;
    reasons: string[];
  }> {
    // Heuristic checks
    const reasons: string[] = [];
    let suspicionScore = 0;

    // Check for rapid posting
    if (userHistory.length >= 2) {
      const timeDiffs = userHistory
        .slice(1)
        .map((post, i) => post.timestamp.getTime() - userHistory[i].timestamp.getTime());

      const avgTimeDiff = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
      if (avgTimeDiff < 5000) {
        // Less than 5 seconds average
        suspicionScore += 0.3;
        reasons.push("Unusually rapid posting pattern");
      }
    }

    // Check for repetitive content
    const uniqueContent = new Set(userHistory.map((p) => p.content.toLowerCase().trim()));
    const repetitionRatio = 1 - uniqueContent.size / userHistory.length;
    if (repetitionRatio > 0.5) {
      suspicionScore += 0.4;
      reasons.push("High content repetition");
    }

    // Check for unnatural uniformity in message length
    const lengths = userHistory.map((p) => p.content.length);
    const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance =
      lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev < avgLength * 0.1) {
      // Very uniform lengths
      suspicionScore += 0.2;
      reasons.push("Suspiciously uniform message lengths");
    }

    return {
      isSuspicious: suspicionScore > 0.5,
      confidence: Math.min(suspicionScore, 1.0),
      reasons,
    };
  }

  async shouldShadowBan(
    toxicityScore: number,
    violationHistory: number
  ): Promise<boolean> {
    // Progressive enforcement
    if (toxicityScore > 0.85) return true; // Severe immediate ban
    if (toxicityScore > 0.6 && violationHistory >= 2) return true; // Repeated moderate violations
    if (violationHistory >= 5) return true; // Pattern of violations

    return false;
  }

  async generateWarning(toxicityAnalysis: ToxicityAnalysis): Promise<string> {
    const topCategory = Object.entries(toxicityAnalysis.categories).sort(
      ([, a], [, b]) => b - a
    )[0][0];

    const warnings: Record<string, string> = {
      hate: "Your message contains language that may be hateful or discriminatory. Please keep debates respectful and focus on ideas, not personal attacks.",
      harassment:
        "Your message may be harassing or personally attacking another user. Debate the topic, not the person.",
      violence:
        "Your message contains violent or threatening language. This is not acceptable on our platform.",
      sexual:
        "Your message contains inappropriate sexual content. Please keep discussions professional.",
      selfHarm:
        "Your message contains concerning content. If you're struggling, please reach out for help.",
    };

    return warnings[topCategory] || "Your message may violate our community guidelines.";
  }
}
