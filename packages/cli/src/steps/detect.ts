import * as clack from "@clack/prompts";
import type { StepContext } from "../context.js";
import type { DetectStep } from "../types.js";
import { handlePrompt } from "./prompt.js";

export async function handleDetect(
  step: DetectStep,
  ctx: StepContext,
): Promise<boolean> {
  // If fromFlag is set and flag was provided, use flag value
  if (step.fromFlag) {
    const flagValue = ctx.flag(step.fromFlag);
    if (flagValue !== undefined && flagValue !== false && flagValue !== "") {
      step.set?.(ctx, flagValue);
      clack.log.success(step.message ?? `${step.name}: ${String(flagValue)}`);
      ctx.markCompleted(step.name);
      return true;
    }
  }

  let result;
  try {
    result = await step.run(ctx);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    clack.log.error(msg);
    ctx.markFailed(step.name);
    return false;
  }

  if (result.status === "found") {
    step.set?.(ctx, result.value);
    clack.log.success(
      step.message ?? `${step.name}: ${String(result.value)}`,
    );
    ctx.markCompleted(step.name);
    return true;
  }

  // Not found — fall through to the fallback prompt
  const promptResult = await handlePrompt(step.fallback, ctx);
  if (promptResult) {
    // The prompt's set() already stored the value; copy it if detect has its own set
    if (step.set && !step.fallback.set) {
      const val = ctx.get(step.fallback.name);
      step.set(ctx, val);
    }
    ctx.markCompleted(step.name);
  } else {
    ctx.markFailed(step.name);
  }
  return promptResult;
}
