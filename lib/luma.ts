import { supabase } from "./supabase";

/**
 * Client for the `luma-chat` Edge Function.
 *
 * The app no longer talks to a model provider directly. It calls our function
 * with the user's Supabase session; the function holds the Gemini key, assembles
 * the system instruction and conversation history server-side, and persists the
 * transcript. Nothing here can leak a provider credential.
 */

export interface LumaReply {
  sessionId: string;
  reply: string;
  /** True when the message tripped the crisis pre-screen. */
  crisis: boolean;
  /** Present when this call created a new conversation. */
  title?: string;
}

export class LumaError extends Error {
  readonly retryable: boolean;

  constructor(message: string, retryable = true) {
    super(message);
    this.name = "LumaError";
    this.retryable = retryable;
  }
}

export async function sendToLuma(
  message: string,
  sessionId: string | null,
): Promise<LumaReply> {
  const { data, error } = await supabase.functions.invoke<
    LumaReply & { error?: string }
  >("luma-chat", {
    body: { message, sessionId },
  });

  if (error) {
    // FunctionsHttpError carries the response; pull our message out of it so
    // the user sees "you've sent a lot of messages" rather than "non-2xx".
    let detail: string | null = null;
    let status: number | null = null;

    const context = (error as { context?: Response }).context;
    if (context && typeof context.json === "function") {
      status = context.status ?? null;
      try {
        const body = await context.json();
        if (body && typeof body.error === "string") detail = body.error;
      } catch {
        // Body wasn't JSON — fall through to the generic message.
      }
    }

    throw new LumaError(
      detail ?? "Luma is having trouble right now. Try again in a moment.",
      status !== 401 && status !== 400,
    );
  }

  if (!data || typeof data.reply !== "string") {
    throw new LumaError("Luma didn't send anything back. Try again.");
  }

  return data;
}
