/**
 * lib/gemini.js — Gemini wrapper and prompt builder for Kaia.
 * Uses @google/generative-ai SDK (native endpoint, compatible with AQ. key format).
 * System prompt is loaded from the KAIA_SYSTEM_PROMPT environment variable.
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

let configValidated = false;

export function validateGeminiConfig() {
  if (configValidated) return;

  if (!process.env.GOOGLE_AI_STUDIO_KEY) {
    throw new Error("[kaia] GOOGLE_AI_STUDIO_KEY environment variable is not set.");
  }

  if (!process.env.KAIA_SYSTEM_PROMPT) {
    throw new Error(
      "[kaia] KAIA_SYSTEM_PROMPT environment variable is not set. " +
      "Add it to your .env file — see .env.example for instructions."
    );
  }

  configValidated = true;
}

/** @type {GoogleGenerativeAI | null} */
let _genAI = null;
function getGenAIClient() {
  const apiKey = process.env.GOOGLE_AI_STUDIO_KEY;
  if (!apiKey) {
    configValidated = false;
    _genAI = null;
    throw new Error("[kaia] GOOGLE_AI_STUDIO_KEY is not set at request time.");
  }
  if (!_genAI) {
    _genAI = new GoogleGenerativeAI(apiKey);
  }
  return _genAI;
}

const MODEL = process.env.AI_MODEL || "gemini-2.5-flash";
const MAX_HISTORY = parseInt(process.env.MAX_HISTORY || "15", 10);
const MAX_RETRIES = parseInt(process.env.AI_MAX_RETRIES || "3", 10);
const RETRY_BASE_MS = parseInt(process.env.AI_RETRY_BASE_MS || "800", 10);
const RETRY_MAX_DELAY_MS = parseInt(process.env.AI_MAX_RETRY_DELAY_MS || "5000", 10);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getModelCandidates() {
  const fallbackRaw = process.env.AI_FALLBACK_MODELS || "";
  const fallbackModels = fallbackRaw.split(",").map((m) => m.trim()).filter(Boolean);
  const hardcodedFallbacks = ["gemini-2.5-flash-preview-04-17", "gemini-1.5-flash"];
  return Array.from(new Set([MODEL, ...fallbackModels, ...hardcodedFallbacks]));
}

function getRetryDelay(attempt) {
  const base = RETRY_BASE_MS * Math.pow(2, attempt);
  const bounded = Math.min(base, RETRY_MAX_DELAY_MS);
  return bounded + Math.floor(Math.random() * 250);
}

function isRetryable(error) {
  const msg = String(error?.message || "").toLowerCase();
  if (msg.includes("429") || msg.includes("rate limit") || msg.includes("quota") ||
      msg.includes("timeout") || msg.includes("temporar") || msg.includes("overloaded") ||
      msg.includes("503") || msg.includes("502") || msg.includes("500")) {
    return true;
  }
  return false;
}

/**
 * Strip common markdown formatting characters from a string.
 * Gemini sometimes returns bold/italic/header syntax that looks wrong in plain-text chat.
 * @param {string} text
 * @returns {string}
 */
function stripMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/gs, "$1")  // **bold**
    .replace(/__(.+?)__/gs, "$1")       // __bold__
    .replace(/\*(.+?)\*/gs, "$1")       // *italic*
    .replace(/_([^_\s][^_]*)_/gs, "$1") // _italic_
    .replace(/^#{1,6}\s+/gm, "")        // # headings
    .replace(/`([^`]+)`/g, "$1");       // `inline code`
}

/**
 * Lazily load and cache the system prompt.
 * @returns {string}
 */
let _cachedSystemPrompt = null;
function getSystemPrompt() {
  if (!_cachedSystemPrompt) {
    validateGeminiConfig();
    _cachedSystemPrompt = process.env.KAIA_SYSTEM_PROMPT.replace(/\\n/g, "\n");
  }
  return _cachedSystemPrompt;
}

/**
 * Build Gemini chat history from DB messages.
 * @param {Array<{role: string, content: string}>} history
 * @returns {Array<{role: string, parts: Array<{text: string}>}>}
 */
function buildGeminiHistory(history) {
  const recent = history.slice(-MAX_HISTORY);
  const geminiHistory = [];
  for (const msg of recent) {
    // Gemini uses "user" and "model" roles only
    const role = (msg.role === "assistant" || msg.role === "owner") ? "model" : "user";
    geminiHistory.push({ role, parts: [{ text: msg.content }] });
  }

  // Gemini requires history to start with a "user" message.
  // Drop leading "model" messages until we hit the first "user".
  while (geminiHistory.length > 0 && geminiHistory[0].role !== "user") {
    geminiHistory.shift();
  }

  // Gemini also requires alternating user/model turns.
  // If two consecutive messages have the same role, merge them.
  const normalized = [];
  for (const msg of geminiHistory) {
    const prev = normalized[normalized.length - 1];
    if (prev && prev.role === msg.role) {
      prev.parts[0].text += "\n" + msg.parts[0].text;
    } else {
      normalized.push({ role: msg.role, parts: [{ text: msg.parts[0].text }] });
    }
  }

  // History must have an even number of turns (user/model pairs) — drop last if unpaired.
  if (normalized.length % 2 !== 0) {
    normalized.pop();
  }

  return normalized;
}

/**
 * Get a chat reply from Kaia using Google Gemini.
 * @param {Array<{role: string, content: string}>} history
 * @param {string} newMessage
 * @param {{ correlationId?: string }} [options]
 * @returns {Promise<string>}
 */
export async function getKaiaReply(history, newMessage, options = {}) {
  const correlationId = options.correlationId || "chat-unknown";
  const models = getModelCandidates();
  let lastError = null;

  console.info("[kaia] Starting Kaia reply request", {
    correlationId,
    modelCandidates: models,
    historyCount: Array.isArray(history) ? history.length : 0,
  });

  for (let modelIndex = 0; modelIndex < models.length; modelIndex += 1) {
    const modelName = models[modelIndex];

    if (modelIndex > 0) {
      console.warn("[kaia] Switching to fallback model", {
        correlationId,
        model: modelName,
        index: modelIndex,
        timestamp: new Date().toISOString(),
      });
    }

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
      try {
        const genAI = getGenAIClient();
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: getSystemPrompt(),
          safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          ],
          generationConfig: { maxOutputTokens: 600, temperature: 0.7 },
        });

        const chat = model.startChat({ history: buildGeminiHistory(history) });
        const result = await chat.sendMessage(newMessage);
        const text = stripMarkdown(result.response.text().trim());

        console.info("[kaia] Gemini response received", {
          correlationId,
          model: modelName,
          attempt,
          textLength: text.length,
        });

        if (text) return text;

        // Empty response — treat as retryable
        const emptyErr = new Error(`[kaia] Empty response from model: ${modelName}`);
        lastError = emptyErr;
        if (attempt < MAX_RETRIES) {
          await sleep(getRetryDelay(attempt));
          continue;
        }
        break;

      } catch (error) {
        lastError = error;
        console.error("[kaia] Gemini request failed", {
          correlationId,
          model: modelName,
          attempt,
          message: error?.message ?? String(error),
          timestamp: new Date().toISOString(),
        });

        const retryable = isRetryable(error);
        if (!retryable || attempt >= MAX_RETRIES) break;

        await sleep(getRetryDelay(attempt));
      }
    }
  }

  if (lastError) throw lastError;
  throw new Error("[kaia] Failed to get reply from all configured models.");
}
