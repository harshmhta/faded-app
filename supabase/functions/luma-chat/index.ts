/**
 * luma-chat — the only thing that talks to Gemini.
 *
 * The Gemini API key is a function secret and never leaves the server, so it
 * cannot be extracted from the app bundle the way the previous DigitalOcean
 * bearer token could. Every request is authenticated as a real Supabase user,
 * rate limited, and persisted under that user's row-level security.
 *
 * Request:  POST { message: string, sessionId?: string }
 * Response: { sessionId, reply, crisis, title? }
 */

import { createClient } from "npm:@supabase/supabase-js@2";

import {
  buildSystemInstruction,
  detectCrisisLanguage,
  type UserContext,
} from "../_shared/prompt.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_MODEL = Deno.env.get("GEMINI_MODEL") ?? "gemini-3.6-flash";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

/** Turns of history sent to the model. Keeps latency and cost predictable. */
const HISTORY_TURNS = 20;
/** User messages allowed per rolling hour, per account. */
const RATE_LIMIT_PER_HOUR = 60;
const MAX_MESSAGE_LENGTH = 4000;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

interface GeminiPart {
  text?: string;
}

interface GeminiResponse {
  candidates?: {
    content?: { parts?: GeminiPart[]; role?: string };
    finishReason?: string;
  }[];
  promptFeedback?: { blockReason?: string };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not configured");
    return json({ error: "Luma is not configured. Contact support." }, 500);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return json({ error: "Not authenticated" }, 401);
  }

  // Bind the client to the caller's JWT so every query below runs under that
  // user's RLS policies. There is no service-role key in this function.
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return json({ error: "Not authenticated" }, 401);
  }

  let body: { message?: unknown; sessionId?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  const requestedSessionId =
    typeof body.sessionId === "string" ? body.sessionId : null;

  if (!message) {
    return json({ error: "Message is required" }, 400);
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return json({ error: "That message is too long." }, 400);
  }

  // ---- Rate limit -------------------------------------------------------

  const oneHourAgo = new Date(Date.now() - 3_600_000).toISOString();
  const { count: recentCount, error: countError } = await supabase
    .from("chat_messages")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("role", "user")
    .gte("created_at", oneHourAgo);

  if (countError) {
    console.error("Rate limit check failed", countError);
  } else if ((recentCount ?? 0) >= RATE_LIMIT_PER_HOUR) {
    return json(
      {
        error:
          "You've sent a lot of messages in a short time. Give it a few minutes.",
      },
      429,
    );
  }

  // ---- Session ----------------------------------------------------------

  let sessionId = requestedSessionId;
  let createdTitle: string | undefined;

  if (sessionId) {
    // RLS means this returns nothing if the session belongs to someone else.
    const { data: existing } = await supabase
      .from("chat_sessions")
      .select("id")
      .eq("id", sessionId)
      .maybeSingle();

    if (!existing) sessionId = null;
  }

  if (!sessionId) {
    createdTitle =
      message.length > 60 ? `${message.slice(0, 57)}...` : message;

    const { data: created, error: createError } = await supabase
      .from("chat_sessions")
      .insert({ user_id: user.id, title: createdTitle })
      .select("id")
      .single();

    if (createError || !created) {
      console.error("Failed to create session", createError);
      return json({ error: "Couldn't start the conversation." }, 500);
    }
    sessionId = created.id;
  }

  // ---- Context and history ---------------------------------------------

  const today = new Date().toISOString().slice(0, 10);

  const [profileResult, progressResult, moodResult, todayLogResult, historyResult] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("display_name, quit_date, daily_spend, currency")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("course_progress")
        .select("current_chapter, streak_days")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("mood_check_ins")
        .select("mood, entry_date")
        .eq("user_id", user.id)
        .order("entry_date", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("consumption_logs")
        .select("status")
        .eq("user_id", user.id)
        .eq("entry_date", today)
        .maybeSingle(),
      supabase
        .from("chat_messages")
        .select("role, content")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true })
        .limit(HISTORY_TURNS * 2),
    ]);

  const profile = profileResult.data;
  const quitDate = profile?.quit_date ? new Date(profile.quit_date) : null;
  const daysClean = quitDate
    ? Math.max(0, Math.floor((Date.now() - quitDate.getTime()) / 86_400_000))
    : null;
  const dailySpend = profile?.daily_spend ? Number(profile.daily_spend) : null;

  const context: UserContext = {
    displayName: profile?.display_name ?? null,
    daysClean,
    quitDate: profile?.quit_date ?? null,
    dailySpend,
    currency: profile?.currency ?? "USD",
    estimatedSaved:
      daysClean !== null && dailySpend !== null ? daysClean * dailySpend : null,
    recentMood: moodResult.data?.mood ?? null,
    recentMoodDate: moodResult.data?.entry_date ?? null,
    currentChapter: progressResult.data?.current_chapter ?? null,
    streakDays: progressResult.data?.streak_days ?? null,
    loggedConsumptionToday:
      (todayLogResult.data?.status as "clean" | "smoked" | undefined) ?? null,
  };

  // This is the fix for the old client, which sent only the newest message and
  // so produced every reply with no memory of the conversation.
  const history = (historyResult.data ?? []).map((row) => ({
    role: row.role === "model" ? "model" : "user",
    parts: [{ text: row.content }],
  }));

  const crisis = detectCrisisLanguage(message);

  // ---- Gemini -----------------------------------------------------------

  let reply: string;

  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: buildSystemInstruction(context) }],
          },
          contents: [...history, { role: "user", parts: [{ text: message }] }],
          generationConfig: {
            temperature: 0.9,
            topP: 0.95,
            maxOutputTokens: 800,
          },
          // Default thresholds refuse ordinary conversation about the user's own
          // cannabis use, which is the entire subject of this app. Loosened to
          // block only high-confidence harm; the system instruction carries the
          // real behavioural limits.
          safetySettings: [
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_ONLY_HIGH",
            },
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
          ],
        }),
      },
    );

    if (!geminiResponse.ok) {
      const detail = await geminiResponse.text();
      console.error("Gemini error", geminiResponse.status, detail);
      return json(
        { error: "Luma is having trouble right now. Try again in a moment." },
        502,
      );
    }

    const payload = (await geminiResponse.json()) as GeminiResponse;
    const candidate = payload.candidates?.[0];
    const text = candidate?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim();

    if (!text) {
      // Blocked by a safety filter, or an empty candidate. Say something true
      // rather than a generic failure, and keep the crisis path intact.
      const blocked =
        payload.promptFeedback?.blockReason ?? candidate?.finishReason;
      console.warn("Empty Gemini candidate", blocked);

      reply = crisis
        ? "I'm here with you. If you're thinking about hurting yourself, please reach out to the 988 Suicide & Crisis Lifeline — you can call or text 988 in the US, any time. You don't have to explain yourself to get help."
        : "I couldn't find a good way to answer that one. Try saying it differently?";
    } else {
      reply = text;
    }
  } catch (error) {
    console.error("Gemini request failed", error);
    return json(
      { error: "Luma is having trouble right now. Try again in a moment." },
      502,
    );
  }

  // ---- Persist ----------------------------------------------------------

  const { error: insertError } = await supabase.from("chat_messages").insert([
    { session_id: sessionId, user_id: user.id, role: "user", content: message },
    { session_id: sessionId, user_id: user.id, role: "model", content: reply },
  ]);

  if (insertError) {
    // The user already has their answer; losing the transcript is not worth
    // failing the request over, but it should be visible in logs.
    console.error("Failed to persist messages", insertError);
  }

  await supabase
    .from("chat_sessions")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", sessionId);

  return json({ sessionId, reply, crisis, title: createdTitle });
});
