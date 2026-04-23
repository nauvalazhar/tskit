import * as clack from "@clack/prompts";
import type { StepContext } from "../context.js";
import type { CheckStep } from "../types.js";

export async function handleCheck(
  step: CheckStep,
  ctx: StepContext,
): Promise<boolean> {
  const result = await step.run(ctx);

  if (result.status === "pass") {
    clack.log.success(result.message ?? step.name);
    ctx.markCompleted(step.name);
    return true;
  }

  clack.log.error(result.message);
  ctx.markFailed(step.name);
  return false;
}
