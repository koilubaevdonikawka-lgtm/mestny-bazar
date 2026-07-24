import type { IPromptSerializer } from "@server/application/ai-prompt-registry/contracts/prompt-serializer.contract";
import {
  createPrompt,
  type Prompt,
} from "@server/application/ai-prompt-registry/models/prompt.model";

/** JSON-based prompt serializer. */
export class JsonPromptSerializer implements IPromptSerializer {
  async serialize(prompt: Prompt): Promise<string> {
    return JSON.stringify(prompt);
  }

  async deserialize(serialized: string): Promise<Prompt> {
    if (!serialized.trim()) {
      throw new Error("Serialized prompt cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<Prompt>;
    return createPrompt({
      promptId: parsed.promptId ?? "",
      name: parsed.name ?? "",
      category: parsed.category ?? "",
      description: parsed.description,
      content: parsed.content ?? "",
      version: parsed.version,
      status: parsed.status,
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt,
    });
  }
}
