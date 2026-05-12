/**
 * Inference & Model Strategy — Internal Types
 *
 * Re-exports shared types from types.ts and defines internal constants
 * for the inference routing subsystem.
 */

export type {
  SurvivalTier,
  ModelProvider,
  InferenceTaskType,
  ModelEntry,
  ModelPreference,
  RoutingMatrix,
  InferenceRequest,
  InferenceResult,
  InferenceCostRow,
  ModelRegistryRow,
  ModelStrategyConfig,
  ChatMessage,
} from "../types.js";

import type {
  RoutingMatrix,
  ModelEntry,
  ModelStrategyConfig,
} from "../types.js";

// === Default Retry Policy ===

export const DEFAULT_RETRY_POLICY = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
} as const;

// === Per-Task Timeout Overrides (ms) ===

export const TASK_TIMEOUTS: Record<string, number> = {
  heartbeat_triage: 15_000,
  safety_check: 30_000,
  summarization: 60_000,
  agent_turn: 120_000,
  planning: 120_000,
};

// === Static Model Baseline ===
// Known models with realistic pricing (hundredths of cents per 1k tokens)

export const STATIC_MODEL_BASELINE: Omit<ModelEntry, "lastSeen" | "createdAt" | "updatedAt">[] = [
  {
    modelId: "meta-llama/llama-3.3-70b-instruct:free",
    provider: "openai",
    displayName: "Llama 3.3 70B (OpenRouter)",
    tierMinimum: "normal",
    costPer1kInput: 0,
    costPer1kOutput: 0,
    maxTokens: 4096,
    contextWindow: 65536,
    supportsTools: true,
    supportsVision: false,
    parameterStyle: "max_tokens",
    enabled: true,
  },
  {
    modelId: "meta-llama/llama-3.1-8b-instruct:free",
    provider: "openai",
    displayName: "Llama 3.1 8B (OpenRouter)",
    tierMinimum: "low_compute",
    costPer1kInput: 0,
    costPer1kOutput: 0,
    maxTokens: 4096,
    contextWindow: 131072,
    supportsTools: true,
    supportsVision: false,
    parameterStyle: "max_tokens",
    enabled: true,
  },
  {
    modelId: "gpt-5.2",
    provider: "openai",
    displayName: "GPT-5.2",
    tierMinimum: "normal",
    costPer1kInput: 18,
    costPer1kOutput: 140,
    maxTokens: 32768,
    contextWindow: 1047576,
    supportsTools: true,
    supportsVision: true,
    parameterStyle: "max_completion_tokens",
    enabled: true,
  },
  {
    modelId: "gpt-4.1",
    provider: "openai",
    displayName: "GPT-4.1",
    tierMinimum: "normal",
    costPer1kInput: 20,
    costPer1kOutput: 80,
    maxTokens: 32768,
    contextWindow: 1047576,
    supportsTools: true,
    supportsVision: true,
    parameterStyle: "max_completion_tokens",
    enabled: true,
  },
  {
    modelId: "gpt-4.1-mini",
    provider: "openai",
    displayName: "GPT-4.1 Mini",
    tierMinimum: "low_compute",
    costPer1kInput: 4,
    costPer1kOutput: 16,
    maxTokens: 16384,
    contextWindow: 1047576,
    supportsTools: true,
    supportsVision: true,
    parameterStyle: "max_completion_tokens",
    enabled: true,
  },
  {
    modelId: "gpt-4.1-nano",
    provider: "openai",
    displayName: "GPT-4.1 Nano",
    tierMinimum: "critical",
    costPer1kInput: 1,
    costPer1kOutput: 4,
    maxTokens: 16384,
    contextWindow: 1047576,
    supportsTools: true,
    supportsVision: false,
    parameterStyle: "max_completion_tokens",
    enabled: true,
  },
  {
    modelId: "gpt-5-mini",
    provider: "openai",
    displayName: "GPT-5 Mini",
    tierMinimum: "low_compute",
    costPer1kInput: 8,
    costPer1kOutput: 32,
    maxTokens: 16384,
    contextWindow: 1047576,
    supportsTools: true,
    supportsVision: true,
    parameterStyle: "max_completion_tokens",
    enabled: true,
  },
  {
    modelId: "gpt-5.3",
    provider: "openai",
    displayName: "GPT-5.3",
    tierMinimum: "normal",
    costPer1kInput: 20,
    costPer1kOutput: 80,
    maxTokens: 32768,
    contextWindow: 1047576,
    supportsTools: true,
    supportsVision: true,
    parameterStyle: "max_completion_tokens",
    enabled: true,
  },
];

// === Default Routing Matrix ===
// Maps (tier, taskType) -> ModelPreference with candidate models

export const DEFAULT_ROUTING_MATRIX: RoutingMatrix = {
  high: {
    agent_turn: { candidates: ["meta-llama/llama-3.3-70b-instruct:free", "meta-llama/llama-3.1-8b-instruct:free"], maxTokens: 1500, ceilingCents: -1 },
    heartbeat_triage: { candidates: ["meta-llama/llama-3.1-8b-instruct:free"], maxTokens: 500, ceilingCents: 5 },
    safety_check: { candidates: ["meta-llama/llama-3.3-70b-instruct:free", "meta-llama/llama-3.1-8b-instruct:free"], maxTokens: 1500, ceilingCents: 20 },
    summarization: { candidates: ["meta-llama/llama-3.3-70b-instruct:free", "meta-llama/llama-3.1-8b-instruct:free"], maxTokens: 1500, ceilingCents: 15 },
    planning: { candidates: ["meta-llama/llama-3.3-70b-instruct:free", "meta-llama/llama-3.1-8b-instruct:free"], maxTokens: 1500, ceilingCents: -1 },
  },
  normal: {
    agent_turn: { candidates: ["meta-llama/llama-3.3-70b-instruct:free", "meta-llama/llama-3.1-8b-instruct:free"], maxTokens: 1500, ceilingCents: -1 },
    heartbeat_triage: { candidates: ["meta-llama/llama-3.1-8b-instruct:free"], maxTokens: 500, ceilingCents: 5 },
    safety_check: { candidates: ["meta-llama/llama-3.3-70b-instruct:free", "meta-llama/llama-3.1-8b-instruct:free"], maxTokens: 1500, ceilingCents: 10 },
    summarization: { candidates: ["meta-llama/llama-3.3-70b-instruct:free", "meta-llama/llama-3.1-8b-instruct:free"], maxTokens: 1000, ceilingCents: 10 },
    planning: { candidates: ["meta-llama/llama-3.3-70b-instruct:free", "meta-llama/llama-3.1-8b-instruct:free"], maxTokens: 1500, ceilingCents: -1 },
  },
  low_compute: {
    agent_turn: { candidates: ["meta-llama/llama-3.1-8b-instruct:free"], maxTokens: 1500, ceilingCents: 10 },
    heartbeat_triage: { candidates: ["meta-llama/llama-3.1-8b-instruct:free"], maxTokens: 500, ceilingCents: 2 },
    safety_check: { candidates: ["meta-llama/llama-3.1-8b-instruct:free"], maxTokens: 1000, ceilingCents: 5 },
    summarization: { candidates: ["meta-llama/llama-3.1-8b-instruct:free"], maxTokens: 750, ceilingCents: 5 },
    planning: { candidates: ["meta-llama/llama-3.1-8b-instruct:free"], maxTokens: 1000, ceilingCents: 5 },
  },
  critical: {
    agent_turn: { candidates: ["meta-llama/llama-3.1-8b-instruct:free"], maxTokens: 500, ceilingCents: 3 },
    heartbeat_triage: { candidates: ["meta-llama/llama-3.1-8b-instruct:free"], maxTokens: 250, ceilingCents: 1 },
    safety_check: { candidates: ["meta-llama/llama-3.1-8b-instruct:free"], maxTokens: 500, ceilingCents: 2 },
    summarization: { candidates: [], maxTokens: 0, ceilingCents: 0 },
    planning: { candidates: [], maxTokens: 0, ceilingCents: 0 },
  },
  dead: {
    agent_turn: { candidates: [], maxTokens: 0, ceilingCents: 0 },
    heartbeat_triage: { candidates: [], maxTokens: 0, ceilingCents: 0 },
    safety_check: { candidates: [], maxTokens: 0, ceilingCents: 0 },
    summarization: { candidates: [], maxTokens: 0, ceilingCents: 0 },
    planning: { candidates: [], maxTokens: 0, ceilingCents: 0 },
  },
};

// === Default Model Strategy Config ===

export const DEFAULT_MODEL_STRATEGY_CONFIG: ModelStrategyConfig = {
  inferenceModel: "meta-llama/llama-3.3-70b-instruct:free",
  lowComputeModel: "meta-llama/llama-3.1-8b-instruct:free",
  criticalModel: "meta-llama/llama-3.1-8b-instruct:free",
  maxTokensPerTurn: 1500,
  hourlyBudgetCents: 0,
  sessionBudgetCents: 0,
  perCallCeilingCents: 0,
  enableModelFallback: true,
  anthropicApiVersion: "2023-06-01",
};
