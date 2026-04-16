/**
 * lib/openai.js — OpenAI wrapper and prompt builder for Kaia.
 * System prompt is loaded from the KAIA_SYSTEM_PROMPT environment variable.
 */

import OpenAI from "openai";

let configValidated = false;

/**
 * Validate required OpenRouter/OpenAI configuration values.
 * @returns {void}
 */
export function validateOpenAIConfig() {
  if (configValidated) return;

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("[openai] OPENROUTER_API_KEY environment variable is not set.");
  }

  if (!process.env.KAIA_SYSTEM_PROMPT) {
    throw new Error(
      "[openai] KAIA_SYSTEM_PROMPT environment variable is not set. " +
      "Add it to your .env file — see .env.example for instructions."
    );
  }

  configValidated = true;
}

/** @type {OpenAI | null} */
let _openai = null;
function getOpenAIClient() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    configValidated = false;
    _openai = null;
    throw new Error("[openai] OPENROUTER_API_KEY is not set at request time.");
  }

  if (!_openai) {
    console.info("[openai] Initializing OpenRouter client, model:", MODEL);
    _openai = new OpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
    });
  }
  return _openai;
}

const MODEL = process.env.OPENAI_MODEL || "google/gemma-4-31b-it:free";
const MAX_HISTORY = parseInt(process.env.MAX_HISTORY || "15", 10);
const MAX_OPENROUTER_RETRIES = parseInt(process.env.OPENROUTER_MAX_RETRIES || "3", 10);
const OPENROUTER_RETRY_BASE_MS = parseInt(process.env.OPENROUTER_RETRY_BASE_MS || "800", 10);
const OPENROUTER_MAX_RETRY_DELAY_MS = parseInt(process.env.OPENROUTER_MAX_RETRY_DELAY_MS || "5000", 10);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getModelCandidates() {
  const fallbackRaw = process.env.OPENAI_FALLBACK_MODELS || "";
  const fallbackModels = fallbackRaw
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);

  // Always keep a minimal hardcoded fallback chain after env-configured models.
  const hardcodedFallbacks = [
    "google/gemini-flash-1.5-8b",
    "meta-llama/llama-3.1-8b-instruct:free",
    "mistralai/mistral-7b-instruct:free",
  ];

  // Keep order stable and remove duplicates.
  return Array.from(new Set([MODEL, ...fallbackModels, ...hardcodedFallbacks]));
}

function summarizeResponseShape(response) {
  const choice = response?.choices?.[0];
  const content = choice?.message?.content;
  return {
    choices: Array.isArray(response?.choices) ? response.choices.length : 0,
    hasMessage: Boolean(choice?.message),
    contentType: Array.isArray(content) ? "array" : typeof content,
    contentParts: Array.isArray(content) ? content.length : 0,
    finishReason: choice?.finish_reason ?? "unknown",
  };
}

function getRetryDelay(attempt) {
  const base = OPENROUTER_RETRY_BASE_MS * Math.pow(2, attempt);
  const bounded = Math.min(base, OPENROUTER_MAX_RETRY_DELAY_MS);
  const jitter = Math.floor(Math.random() * 250);
  return bounded + jitter;
}

function extractReplyText(response) {
  const direct = response?.choices?.[0]?.message?.content;
  if (typeof direct === "string" && direct.trim()) return direct.trim();

  // OpenRouter may return content as structured parts with some models/providers.
  if (Array.isArray(direct)) {
    const joined = direct
      .map((part) => (typeof part?.text === "string" ? part.text : ""))
      .join("")
      .trim();
    if (joined) return joined;
  }

  return "";
}

function isRetryableOpenRouterError(error) {
  const status = error?.status ?? error?.response?.status;
  if ([408, 409, 425, 429, 500, 502, 503, 504, 524].includes(status)) return true;

  if (error?.isEmptyResponse === true) return true;

  const code = String(error?.code || "").toLowerCase();
  if (["etimedout", "econnreset", "eai_again", "econnaborted", "abort_error", "empty_response"].includes(code)) {
    return true;
  }

  const message = String(error?.message || "").toLowerCase();
  return (
    message.includes("timeout") ||
    message.includes("rate limit") ||
    message.includes("temporar") ||
    message.includes("overloaded") ||
    message.includes("upstream") ||
    message.includes("empty response")
  );
}

/**
 * Lazily load and cache the system prompt from the KAIA_SYSTEM_PROMPT env var.
 * Literal \n sequences are converted to real newlines so the value can be
 * stored as a single line in .env environment variables.
 * @returns {string}
 */
let _cachedSystemPrompt = null;
function getSystemPrompt() {
  if (!_cachedSystemPrompt) {
    validateOpenAIConfig();
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
 * @param {{ correlationId?: string }} [options] - Request diagnostics context
 * @returns {Promise<string>} Kaia's reply text
 */
export async function getKaiaReply(history, newMessage, options = {}) {
  const correlationId = options.correlationId || "chat-unknown";
  const messages = buildMessages(history, newMessage);
  const models = getModelCandidates();
  let lastError = null;

  console.info("[openai] Starting Kaia reply request", {
    correlationId,
    modelCandidates: models,
    historyCount: Array.isArray(history) ? history.length : 0,
    maxRetriesPerModel: MAX_OPENROUTER_RETRIES,
  });

  for (let modelIndex = 0; modelIndex < models.length; modelIndex += 1) {
    const model = models[modelIndex];

    if (modelIndex > 0) {
      console.warn("[openai] Switching to fallback model", {
        correlationId,
        model,
        index: modelIndex,
        totalCandidates: models.length,
        timestamp: new Date().toISOString(),
      });
    }

    for (let attempt = 0; attempt <= MAX_OPENROUTER_RETRIES; attempt += 1) {
      try {
        const response = await getOpenAIClient().chat.completions.create({
          model,
          messages,
          max_tokens: 600,
          temperature: 0.7,
        });

        console.info("[openai] OpenRouter response received", {
          correlationId,
          model,
          attempt,
          shape: summarizeResponseShape(response),
        });

        const text = extractReplyText(response);
        if (text) return text;

        // Treat empty text as retryable so we can retry/back off and then move to next model.
        const emptyResponseError = new Error(`[openai] Empty response content from model: ${model}`);
        emptyResponseError.code = "empty_response";
        emptyResponseError.isEmptyResponse = true;
        lastError = emptyResponseError;

        console.error("[openai] OpenRouter returned empty response", {
          correlationId,
          model,
          attempt,
          status: "empty",
          retryable: true,
          message: emptyResponseError.message,
          shape: summarizeResponseShape(response),
          timestamp: new Date().toISOString(),
        });

        const retryable = isRetryableOpenRouterError(emptyResponseError);
        const hasRetry = attempt < MAX_OPENROUTER_RETRIES;

        if (!retryable || !hasRetry) break;

        const delay = getRetryDelay(attempt);
        console.warn("[openai] Retrying after empty response", {
          correlationId,
          model,
          attempt,
          delayMs: delay,
          reason: "empty_response",
        });
        await sleep(delay);
        continue;
      } catch (error) {
        lastError = error;
        console.error("[openai] OpenRouter request failed", {
          correlationId,
          model,
          attempt,
          status: error?.status ?? error?.response?.status ?? "unknown",
          code: error?.code ?? "unknown",
          message: error?.message ?? String(error),
          timestamp: new Date().toISOString(),
        });
        const retryable = isRetryableOpenRouterError(error);
        const hasRetry = attempt < MAX_OPENROUTER_RETRIES;

        if (!retryable || !hasRetry) break;

        const delay = getRetryDelay(attempt);
        console.warn("[openai] Retrying OpenRouter request", {
          correlationId,
          model,
          attempt,
          delayMs: delay,
          reason: error?.code || error?.message || "unknown",
        });
        await sleep(delay);
      }
    }
  }

  if (lastError) throw lastError;
  throw new Error("[openai] Failed to get reply from all configured models.");
}
