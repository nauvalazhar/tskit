import type { StepContext } from "./context.js";

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export interface PassResult {
  status: "pass";
  message?: string;
}

export interface FailResult {
  status: "fail";
  message: string;
}

export interface FoundResult {
  status: "found";
  value: unknown;
}

export interface NotFoundResult {
  status: "not-found";
}

// ---------------------------------------------------------------------------
// Step definitions
// ---------------------------------------------------------------------------

export interface CheckStep {
  type: "check";
  name: string;
  run: (ctx: StepContext) => Promise<PassResult | FailResult>;
  when?: (ctx: StepContext) => boolean;
}

export interface DetectStep {
  type: "detect";
  name: string;
  message?: string;
  run: (ctx: StepContext) => Promise<FoundResult | NotFoundResult>;
  fallback: PromptStep;
  fromFlag?: string;
  when?: (ctx: StepContext) => boolean;
  set?: (ctx: StepContext, value: unknown) => void;
}

export interface PromptStep {
  type: "prompt";
  name: string;
  message: string;
  promptType?: "text" | "confirm" | "select" | "multiselect";
  choices?: string[];
  default?: string | ((ctx: StepContext) => string);
  placeholder?: string;
  env?: string | string[];
  validate?: (value: string) => boolean | string;
  fromFlag?: string;
  fromContext?: string;
  required?: boolean | ((ctx: StepContext) => boolean);
  when?: (ctx: StepContext) => boolean;
  set?: (ctx: StepContext, value: unknown) => void;
}

export interface RunStep {
  type: "run";
  name: string;
  message: string;
  command?: string;
  run?: (ctx: StepContext) => Promise<void>;
  when?: (ctx: StepContext) => boolean;
  idempotent?: boolean;
  marker?: string;
}

export interface StubStep {
  type: "stub";
  name: string;
  message?: string;
  from: string | ((ctx: StepContext) => string);
  to: string | ((ctx: StepContext) => string);
  when?: (ctx: StepContext) => boolean;
}

export type Step = CheckStep | DetectStep | PromptStep | RunStep | StubStep;

// ---------------------------------------------------------------------------
// Command & config definitions
// ---------------------------------------------------------------------------

export interface ArgDefinition {
  name: string;
  description?: string;
  required?: boolean;
  default?: string;
}

export interface FlagDefinition {
  name: string;
  alias?: string;
  description?: string;
  type: "string" | "boolean";
  default?: string | boolean;
}

export interface CommandDefinition {
  description: string;
  args?: ArgDefinition[];
  flags?: FlagDefinition[];
  steps: Step[];
  summary?: (ctx: StepContext) => string;
}

export interface TSKitConfig {
  commands: Record<string, CommandDefinition>;
}

// ---------------------------------------------------------------------------
// Result factory helpers
// ---------------------------------------------------------------------------

export function pass(message?: string): PassResult {
  return { status: "pass", message };
}

export function fail(message: string): FailResult {
  return { status: "fail", message };
}

export function found(value: unknown): FoundResult {
  return { status: "found", value };
}

export function notFound(): NotFoundResult {
  return { status: "not-found" };
}

// ---------------------------------------------------------------------------
// Step factory helpers
// ---------------------------------------------------------------------------

export function check(
  name: string,
  opts: Omit<CheckStep, "type" | "name">,
): CheckStep {
  return { type: "check", name, ...opts };
}

export function detect(
  name: string,
  opts: Omit<DetectStep, "type" | "name">,
): DetectStep {
  return { type: "detect", name, ...opts };
}

export function prompt(
  name: string,
  opts: Omit<PromptStep, "type" | "name">,
): PromptStep {
  return { type: "prompt", name, ...opts };
}

export function run(
  name: string,
  opts: Omit<RunStep, "type" | "name">,
): RunStep {
  return { type: "run", name, ...opts };
}

export function stub(
  name: string,
  opts: Omit<StubStep, "type" | "name">,
): StubStep {
  return { type: "stub", name, ...opts };
}

// ---------------------------------------------------------------------------
// Config helper
// ---------------------------------------------------------------------------

export function defineConfig(config: TSKitConfig): TSKitConfig {
  return config;
}
