import * as clack from "@clack/prompts";
import type { StepContext } from "../context.js";
import type { PromptStep } from "../types.js";

function readProcessEnv(keys: string | string[]): string | undefined {
  const envKeys = Array.isArray(keys) ? keys : [keys];
  for (const key of envKeys) {
    const val = process.env[key];
    if (val !== undefined && val !== "") return val;
  }
  return undefined;
}

/**
 * Validate a value using the step's validate function.
 * Returns undefined if valid, or an error message string if invalid.
 */
function validateValue(step: PromptStep, value: string): string | undefined {
  if (!step.validate) return undefined;
  const result = step.validate(value);
  if (result === true) return undefined;
  if (typeof result === "string") return result;
  return "Invalid input";
}

export async function handlePrompt(
  step: PromptStep,
  ctx: StepContext,
): Promise<boolean> {
  // Try to resolve value from pre-supplied sources (flag, context, env)
  let preSupplied: unknown | undefined;
  let preSuppliedSource: "flag" | "context" | "env" | undefined;

  if (step.fromFlag) {
    const flagValue = ctx.flag(step.fromFlag);
    if (flagValue !== undefined && flagValue !== false && flagValue !== "") {
      preSupplied = flagValue;
      preSuppliedSource = "flag";
    }
  }

  if (preSupplied === undefined && step.fromContext) {
    const ctxValue = ctx.get(step.fromContext);
    if (ctxValue !== undefined && ctxValue !== "") {
      preSupplied = ctxValue;
      preSuppliedSource = "context";
    }
  }

  if (preSupplied === undefined && step.env) {
    const envValue = readProcessEnv(step.env);
    if (envValue !== undefined) {
      preSupplied = envValue;
      preSuppliedSource = "env";
    }
  }

  // If we have a pre-supplied value, validate it before accepting
  if (preSupplied !== undefined) {
    if (step.validate && typeof preSupplied === "string") {
      const error = validateValue(step, preSupplied);
      if (error) {
        const source = preSuppliedSource === "flag" ? ` (--${step.fromFlag})` : "";
        clack.log.error(`${step.message}: ${error}${source}`);
        ctx.markFailed(step.name);
        return false;
      }
    }
    step.set?.(ctx, preSupplied);
    ctx.markCompleted(step.name);
    return true;
  }

  // Resolve default value
  const defaultValue =
    typeof step.default === "function" ? step.default(ctx) : step.default;

  // Non-interactive mode or required: use default or fail, never prompt
  // Commander converts --no-interactive to { interactive: false }
  // undefined means the flag was never registered — don't treat as non-interactive
  const interactiveFlag = ctx.flag("interactive");
  const isNonInteractive = interactiveFlag !== undefined && interactiveFlag === false;
  const isRequired = typeof step.required === "function" ? step.required(ctx) : step.required;

  if (isNonInteractive || isRequired) {
    if (defaultValue !== undefined && defaultValue !== "") {
      // Convert string defaults to appropriate types for non-text prompts
      let val: unknown = defaultValue;
      if (step.promptType === "confirm") {
        val = defaultValue === "true" || defaultValue === "yes";
      }
      if (step.validate && typeof val === "string") {
        const error = validateValue(step, val);
        if (error) {
          clack.log.error(`${step.message}: ${error} (default "${val}")`);
          ctx.markFailed(step.name);
          return false;
        }
      }
      step.set?.(ctx, val);
      ctx.markCompleted(step.name);
      return true;
    }
    clack.log.error(`${step.message}: value is required`);
    ctx.markFailed(step.name);
    return false;
  }

  let value: unknown;

  switch (step.promptType ?? "text") {
    case "text": {
      value = await clack.text({
        message: step.message,
        defaultValue,
        placeholder: step.placeholder,
        validate: step.validate
          ? (val) => {
              const result = step.validate!(val);
              if (result === true) return undefined;
              if (typeof result === "string") return result;
              return "Invalid input";
            }
          : undefined,
      });
      break;
    }
    case "confirm": {
      value = await clack.confirm({
        message: step.message,
      });
      break;
    }
    case "select": {
      value = await clack.select({
        message: step.message,
        options: (step.choices ?? []).map((c) => ({ value: c, label: c })),
      });
      break;
    }
    case "multiselect": {
      value = await clack.multiselect({
        message: step.message,
        options: (step.choices ?? []).map((c) => ({ value: c, label: c })),
        required: false,
      });
      break;
    }
  }

  if (clack.isCancel(value)) {
    clack.cancel("Operation cancelled.");
    ctx.cancel();
    ctx.markFailed(step.name);
    return false;
  }

  step.set?.(ctx, value);
  ctx.markCompleted(step.name);
  return true;
}
