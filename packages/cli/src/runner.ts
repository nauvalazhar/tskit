import * as clack from "@clack/prompts";
import type { StepContext } from "./context.js";
import type { Step } from "./types.js";
import {
  handleCheck,
  handleDetect,
  handlePrompt,
  handleRun,
  handleStub,
} from "./steps/index.js";

export async function runPipeline(
  steps: Step[],
  ctx: StepContext,
): Promise<boolean> {
  for (const step of steps) {
    // Check `when` condition for step types that support it
    if ("when" in step && step.when && !step.when(ctx)) {
      ctx.markCompleted(step.name);
      continue;
    }

    let success: boolean;

    switch (step.type) {
      case "check":
        success = await handleCheck(step, ctx);
        break;
      case "detect":
        success = await handleDetect(step, ctx);
        break;
      case "prompt":
        success = await handlePrompt(step, ctx);
        break;
      case "run":
        success = await handleRun(step, ctx);
        break;
      case "stub":
        success = await handleStub(step, ctx);
        break;
    }

    if (!success) {
      if (!ctx.isCancelled) {
        clack.log.error(
          "Fix the issue and run again. Completed steps will be skipped.",
        );
      }
      return false;
    }
  }

  return true;
}
