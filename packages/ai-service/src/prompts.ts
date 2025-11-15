export const SYSTEM_PROMPTS = {
  NEUTRAL_BRIEFING: `You are an objective debate assistant. Provide balanced, factual information about debate topics without bias. Include key arguments from all perspectives, relevant facts, and common misconceptions. Your goal is to help debaters understand the full context of an issue.`,

  ARGUMENT_ANALYZER: `You are an expert debate judge and rhetorical analyst. Evaluate arguments based on:
1. Logical structure and coherence
2. Evidence quality and source credibility
3. Rhetorical effectiveness
4. Clarity and persuasiveness

Provide constructive, educational feedback. Be fair and objective.`,

  TOXICITY_MODERATOR: `You are a content moderation assistant. Analyze text for toxic content including:
- Hate speech
- Personal attacks and harassment
- Threats or violent language
- Discriminatory language
- Sexual content

Be nuanced - distinguish between passionate debate and actual toxicity. Context matters.`,

  FACT_CHECKER: `You are a fact-checking assistant. Analyze claims for factual accuracy using:
- Scientific consensus
- Credible primary sources
- Statistical data
- Expert opinion

Provide clear verdicts (True, Mostly True, Partly True, Mostly False, False, Unverifiable) with explanations and sources.`,

  FALLACY_DETECTOR: `You are a logical reasoning expert. Identify logical fallacies including:
- Ad hominem
- Straw man
- False dichotomy
- Slippery slope
- Appeal to emotion
- Appeal to authority
- Hasty generalization
- Post hoc ergo propter hoc

Explain each fallacy educationally.`,

  DEBATE_JUDGE: `You are an expert debate judge. Evaluate debates holistically considering:
- Strength of arguments
- Quality and credibility of evidence
- Logical consistency
- Responsiveness to opponent's points
- Rhetorical skill
- Finding common ground

Determine winner and provide detailed analysis. Be fair and explain your reasoning.`,

  COMMON_GROUND_FINDER: `You are a mediator focused on finding areas of agreement. Analyze debates to identify:
- Shared values
- Points of consensus
- Areas of potential compromise
- Mutual understanding

Help debaters see where they already agree, even while disagreeing on conclusions.`,
};

export const PROMPT_TEMPLATES = {
  generateBriefing: (topic: string) => `
Generate a neutral, comprehensive briefing on the debate topic: "${topic}"

Include:
1. Background and context
2. Key arguments for each major position
3. Important facts and statistics
4. Common misconceptions
5. Relevant recent developments

Be balanced and informative. Aim for 300-500 words.
`,

  analyzeArgument: (argument: string, position: string) => `
Analyze this debate argument:

Position: ${position}
Argument: "${argument}"

Provide scores (0-100) and feedback for:
1. Structure - Is it well-organized and coherent?
2. Clarity - Is it clear and understandable?
3. Evidence - Are claims supported?
4. Reasoning - Is the logic sound?

Return your analysis as JSON in this format:
{
  "structure": number,
  "clarity": number,
  "evidence": number,
  "reasoning": number,
  "overall": number,
  "feedback": "string with constructive feedback"
}
`,

  checkToxicity: (text: string) => `
Analyze this text for toxic content:

"${text}"

Evaluate for:
- Hate speech
- Harassment
- Violence
- Sexual content
- Self-harm

Return as JSON:
{
  "score": number (0.0 to 1.0),
  "categories": {
    "hate": number,
    "harassment": number,
    "violence": number,
    "sexual": number,
    "selfHarm": number
  },
  "isToxic": boolean,
  "explanation": "string"
}
`,

  factCheck: (claim: string) => `
Fact-check this claim:

"${claim}"

Determine:
1. Verdict (TRUE, MOSTLY_TRUE, PARTLY_TRUE, MOSTLY_FALSE, FALSE, UNVERIFIABLE)
2. Confidence level (0-100)
3. Explanation with reasoning
4. Relevant sources to verify

Return as JSON:
{
  "verdict": "string",
  "confidence": number,
  "explanation": "string",
  "sources": [
    {
      "title": "string",
      "url": "string",
      "credibility": number
    }
  ]
}
`,

  detectFallacies: (argument: string) => `
Identify logical fallacies in this argument:

"${argument}"

For each fallacy found, specify:
- Type of fallacy
- Location in text
- Severity (low, medium, high)
- Educational explanation

Return as JSON:
{
  "fallacies": [
    {
      "type": "string",
      "description": "string",
      "severity": "string",
      "explanation": "string"
    }
  ],
  "hasFallacies": boolean
}
`,

  judgeDebate: (
    topic: string,
    participant1: { name: string; position: string; arguments: string[] },
    participant2: { name: string; position: string; arguments: string[] }
  ) => `
Judge this debate:

Topic: ${topic}

${participant1.name} (${participant1.position}):
${participant1.arguments.map((arg, i) => `${i + 1}. ${arg}`).join("\n")}

${participant2.name} (${participant2.position}):
${participant2.arguments.map((arg, i) => `${i + 1}. ${arg}`).join("\n")}

Provide:
1. Winner determination with confidence
2. Scores for each participant (structure, evidence, rhetoric, logic)
3. Key highlights
4. Common ground identified
5. Suggestions for improvement

Return as JSON:
{
  "winner": {
    "participant": "string (name)",
    "confidence": number
  },
  "scores": {
    "${participant1.name}": {
      "argumentStructure": number,
      "evidenceQuality": number,
      "rhetoricEffectiveness": number,
      "logicalConsistency": number,
      "overall": number
    },
    "${participant2.name}": {
      "argumentStructure": number,
      "evidenceQuality": number,
      "rhetoricEffectiveness": number,
      "logicalConsistency": number,
      "overall": number
    }
  },
  "summary": "string",
  "commonGround": ["string"],
  "keyDisagreements": ["string"],
  "highlights": [
    {
      "participant": "string",
      "description": "string",
      "type": "string"
    }
  ],
  "suggestions": {
    "${participant1.name}": "string",
    "${participant2.name}": "string"
  }
}
`,

  findCommonGround: (
    participant1Arguments: string[],
    participant2Arguments: string[]
  ) => `
Find areas of agreement and common ground between these positions:

Position A:
${participant1Arguments.join("\n")}

Position B:
${participant2Arguments.join("\n")}

Identify:
1. Shared values
2. Points of agreement
3. Areas of potential compromise
4. Mutual understanding

Return as JSON:
{
  "commonGround": ["string"],
  "sharedValues": ["string"],
  "compromisePotential": ["string"],
  "summary": "string"
}
`,

  suggestArguments: (topic: string, position: string, context?: string) => `
Suggest strong arguments for this debate:

Topic: ${topic}
Position: ${position}
${context ? `Context: ${context}` : ""}

Provide 3-5 compelling arguments with:
- Clear main point
- Supporting evidence
- Potential counterarguments to address

Return as JSON:
{
  "arguments": [
    {
      "mainPoint": "string",
      "explanation": "string",
      "evidence": "string",
      "counterarguments": ["string"]
    }
  ]
}
`,
};
