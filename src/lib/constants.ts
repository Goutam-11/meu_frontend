export const MODELS = [
  'openai/gpt-4o',
  'mistralai/devstral-2512:free',
  'deepseek/deepseek-v3.2',
  'deepseek/deepseek-chat-v3.1',
  'anthropic/claude-sonnet-4.5',
  'deepseek-ai/deepseek-v3.2',
  'deepseek-ai/deepseek-v3.1'
]

/**
 * Model catalog per credential provider (matches schedulerService's
 * src/agent/providers.ts registry). Falls back to MODELS when a provider
 * has no entry or no credential is selected.
 */
export const PROVIDER_MODELS: Record<string, string[]> = {
  OPENROUTER: [
    "openai/gpt-4o",
    "anthropic/claude-sonnet-4.5",
    "deepseek/deepseek-chat-v3.1",
    "deepseek/deepseek-v3.2",
    "mistralai/devstral-2512:free",
  ],
  NVIDIA_NIM: [
    "deepseek-ai/deepseek-v3.1",
    "deepseek-ai/deepseek-v3.2",
    "meta/llama-3.3-70b-instruct",
    "nvidia/llama-3.3-nemotron-super-49b-v1",
  ],
  ANTHROPIC: ["claude-sonnet-4-5", "claude-haiku-4-5"],
  OPENAI: ["gpt-4o", "gpt-4o-mini", "gpt-4.1"],
  OPENCODE: ["claude-sonnet-4-5", "qwen3-coder", "grok-code", "kimi-k2"],
};
