/**
 * lib/openai.js — OpenAI wrapper and prompt builder for Kaia.
 * Reads the Kaia system prompt from system-prompt.txt and builds
 * the messages array with conversation history.
 */

import OpenAI from "openai";
import fs from "fs";
import path from "path";

/** @type {OpenAI} */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const MAX_HISTORY = parseInt(process.env.MAX_HISTORY || "15", 10);

/**
 * Lazily load and cache the system prompt from disk.
 * @returns {string}
 */
let _cachedSystemPrompt = null;
function getSystemPrompt() {
  if (!_cachedSystemPrompt) {
    const filePath = path.join(process.cwd(), "system-prompt.txt");
    _cachedSystemPrompt = fs.readFileSync(filePath, "utf-8");
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

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages,
    max_tokens: 600,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content?.trim() ?? "Maaf, saya tidak bisa menjawab saat ini.";
}
