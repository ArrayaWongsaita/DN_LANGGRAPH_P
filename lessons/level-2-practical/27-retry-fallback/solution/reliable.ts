import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

export async function askSturdy(
  primary: BaseChatModel,
  backup: BaseChatModel,
  question: string,
): Promise<string> {
  const retrying = primary.withRetry({ stopAfterAttempt: 3 });
  const sturdy = retrying.withFallbacks({ fallbacks: [backup] });
  const reply = await sturdy.invoke(question);
  return (reply as { text: string }).text;
}
