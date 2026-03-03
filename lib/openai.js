/**
 * lib/openai.js — OpenAI wrapper and prompt builder for Kaia.
 * System prompt is loaded from the KAIA_SYSTEM_PROMPT environment variable.
 */

import OpenAI from "openai";

/** @type {OpenAI | null} */
let _openai = null;
function getOpenAIClient() {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

const MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const MAX_HISTORY = parseInt(process.env.MAX_HISTORY || "15", 10);

/**
 * Lazily load and cache the system prompt from the KAIA_SYSTEM_PROMPT env var.
 * Literal \n sequences are converted to real newlines so the value can be
 * stored as a single line in .env / Railway environment variables.
 * @returns {string}
 */
let _cachedSystemPrompt = null;
function getSystemPrompt() {
  if (!_cachedSystemPrompt) {
    if (!process.env.KAIA_SYSTEM_PROMPT) {
      throw new Error(
        "[openai] KAIA_SYSTEM_PROMPT environment variable is not set. " +
        "Add it to your .env file — see .env.example for instructions."
      );
    }
    _cachedSystemPrompt = process.env.KAIA_SYSTEM_PROMPT.replace(/\\n/g, "\n");
  }
  return _cachedSystemPrompt;
}

/**
 * Build the OpenAI messages array from conversation history + new message.
 * @param {Array<{role: string, content: string}>} history - Last N messages from DB
 * @param {string} newMessage - The latest visitor message
 * @returns {Array<import('openai').OpenAI.Chat.ChatCompletionMessageParam>}
 */
function buildMessages(history, newMessage) {
  const systemPrompt = getSystemPrompt();

  /** @type {import('openai').OpenAI.Chat.ChatCompletionMessageParam[]} */
  const messages = [{ role: "system", content: systemPrompt }];

  // Map DB roles to OpenAI roles: "owner" messages appear as assistant context
  const recent = history.slice(-MAX_HISTORY);
  for (const msg of recent) {
    const role = msg.role === "owner" ? "assistant" : msg.role;
    messages.push({ role, content: msg.content });
  }

  // Append the new visitor message
  messages.push({ role: "user", content: newMessage });

  return messages;
}

/**
 * Get a chat completion from Kaia (OpenAI).
 * @param {Array<{role: string, content: string}>} history - Previous messages
 * @param {string} newMessage - The new visitor message
 * @returns {Promise<string>} Kaia's reply text
 */
export async function getKaiaReply(history, newMessage) {
  const messages = buildMessages(history, newMessage);

  const response = await getOpenAIClient().chat.completions.create({
    model: MODEL,
    messages,
    max_tokens: 600,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content?.trim() ?? "Maaf, saya tidak bisa menjawab saat ini.";
}
