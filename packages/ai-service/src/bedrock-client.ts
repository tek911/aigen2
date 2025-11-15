import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelCommandInput,
} from "@aws-sdk/client-bedrock-runtime";

export interface BedrockConfig {
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
}

export interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ClaudeResponse {
  content: Array<{
    type: "text";
    text: string;
  }>;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class BedrockClient {
  private client: BedrockRuntimeClient;
  private modelId: string;

  constructor(config: BedrockConfig, modelId?: string) {
    this.client = new BedrockRuntimeClient({
      region: config.region,
      credentials: config.accessKeyId && config.secretAccessKey
        ? {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
          }
        : undefined,
    });
    this.modelId = modelId || "anthropic.claude-3-sonnet-20240229-v1:0";
  }

  async invokeModel(
    messages: ClaudeMessage[],
    options?: {
      systemPrompt?: string;
      maxTokens?: number;
      temperature?: number;
    }
  ): Promise<ClaudeResponse> {
    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: options?.maxTokens || 4096,
      temperature: options?.temperature || 1.0,
      messages,
      ...(options?.systemPrompt && { system: options.systemPrompt }),
    };

    const input: InvokeModelCommandInput = {
      modelId: this.modelId,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(payload),
    };

    try {
      const command = new InvokeModelCommand(input);
      const response = await this.client.send(command);

      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      return responseBody as ClaudeResponse;
    } catch (error) {
      console.error("Bedrock invocation error:", error);
      throw new Error(`Failed to invoke Bedrock model: ${error}`);
    }
  }

  async generateText(
    prompt: string,
    systemPrompt?: string,
    options?: {
      maxTokens?: number;
      temperature?: number;
    }
  ): Promise<string> {
    const response = await this.invokeModel(
      [{ role: "user", content: prompt }],
      { systemPrompt, ...options }
    );

    return response.content[0].text;
  }

  async generateStructuredOutput<T>(
    prompt: string,
    systemPrompt: string,
    schema: string,
    options?: {
      maxTokens?: number;
    }
  ): Promise<T> {
    const fullPrompt = `${prompt}\n\nRespond with a valid JSON object matching this schema:\n${schema}`;

    const response = await this.generateText(fullPrompt, systemPrompt, {
      ...options,
      temperature: 0.3, // Lower temperature for structured output
    });

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = response.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.slice(7, -3).trim();
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.slice(3, -3).trim();
    }

    try {
      return JSON.parse(jsonText) as T;
    } catch (error) {
      console.error("Failed to parse AI response as JSON:", jsonText);
      throw new Error("AI response was not valid JSON");
    }
  }
}

// Singleton instance
let bedrockClient: BedrockClient | null = null;

export function getBedrockClient(): BedrockClient {
  if (!bedrockClient) {
    bedrockClient = new BedrockClient({
      region: process.env.AWS_REGION || "us-east-1",
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
  }
  return bedrockClient;
}
