import { getBedrockClient } from "./bedrock-client";
import { SYSTEM_PROMPTS, PROMPT_TEMPLATES } from "./prompts";
import type { FactCheckResult } from "@arena/shared";

export class FactCheckerService {
  private client = getBedrockClient();
  private cache = new Map<string, { result: FactCheckResult; timestamp: number }>();
  private readonly CACHE_TTL = 86400000; // 24 hours

  async checkClaim(claim: string): Promise<FactCheckResult> {
    // Check cache first
    const cached = this.cache.get(claim.toLowerCase().trim());
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.result;
    }

    try {
      const result = await this.client.generateStructuredOutput<FactCheckResult>(
        PROMPT_TEMPLATES.factCheck(claim),
        SYSTEM_PROMPTS.FACT_CHECKER,
        JSON.stringify({
          verdict: "string",
          confidence: "number",
          explanation: "string",
          sources: [
            {
              title: "string",
              url: "string",
              credibility: "number",
            },
          ],
        })
      );

      // Cache the result
      this.cache.set(claim.toLowerCase().trim(), {
        result,
        timestamp: Date.now(),
      });

      return result;
    } catch (error) {
      console.error("Fact check failed:", error);
      return {
        claim,
        verdict: "UNVERIFIABLE",
        confidence: 0,
        explanation: "Unable to verify this claim at this time.",
        sources: [],
      };
    }
  }

  async batchCheckClaims(claims: string[]): Promise<FactCheckResult[]> {
    // Process in parallel with concurrency limit
    const results: FactCheckResult[] = [];
    const batchSize = 3;

    for (let i = 0; i < claims.length; i += batchSize) {
      const batch = claims.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map((claim) => this.checkClaim(claim)));
      results.push(...batchResults);
    }

    return results;
  }

  async extractClaims(text: string): Promise<string[]> {
    const prompt = `Extract factual claims from this text that could be fact-checked:

"${text}"

Focus on:
- Statistical claims
- Historical facts
- Scientific statements
- Specific assertions

Return as JSON: { "claims": ["string"] }`;

    try {
      const result = await this.client.generateStructuredOutput<{ claims: string[] }>(
        prompt,
        "You are a fact-checking assistant that identifies verifiable claims.",
        JSON.stringify({ claims: ["string"] })
      );

      return result.claims;
    } catch (error) {
      console.error("Claim extraction failed:", error);
      return [];
    }
  }

  async autoFactCheck(
    text: string
  ): Promise<{
    originalText: string;
    claims: string[];
    results: FactCheckResult[];
    overallCredibility: number;
  }> {
    const claims = await this.extractClaims(text);
    const results = await this.batchCheckClaims(claims);

    // Calculate overall credibility
    const verdictScores: Record<string, number> = {
      TRUE: 1.0,
      MOSTLY_TRUE: 0.8,
      PARTLY_TRUE: 0.5,
      MOSTLY_FALSE: 0.2,
      FALSE: 0.0,
      UNVERIFIABLE: 0.5,
    };

    const avgScore =
      results.length > 0
        ? results.reduce((sum, r) => sum + verdictScores[r.verdict], 0) / results.length
        : 0.5;

    return {
      originalText: text,
      claims,
      results,
      overallCredibility: avgScore * 100,
    };
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; oldestEntry: number | null } {
    let oldest: number | null = null;
    for (const { timestamp } of this.cache.values()) {
      if (oldest === null || timestamp < oldest) {
        oldest = timestamp;
      }
    }
    return {
      size: this.cache.size,
      oldestEntry: oldest,
    };
  }
}
