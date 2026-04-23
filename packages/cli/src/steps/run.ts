import * as clack from "@clack/prompts";
import type { StepContext } from "../context.js";
import type { RunStep } from "../types.js";
import { markerExists, createMarker } from "../utils/idempotency.js";

export async function handleRun(
  step: RunStep,
  ctx: StepContext,
): Promise<boolean> {
  // Check idempotency via marker
  if (step.marker && (await markerExists(step.marker))) {
    clack.log.info(`${step.message} (already done)`);
    ctx.markCompleted(step.name);
    return true;
  }

  const s = clack.spinner();
  s.start(step.message);

  try {
    if (step.command) {
      const result = await ctx.run(step.command);
      if (result.exitCode !== 0) {
        s.stop(`${step.message} — failed`, 1);
        clack.log.error(result.stdout);
        ctx.markFailed(step.name);
        return false;
      }
    } else if (step.run) {
      await step.run(ctx);
    }

    s.stop(step.message, 0);

    if (step.marker) {
      await createMarker(step.marker);
    }

    ctx.markCompleted(step.name);
    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    s.stop(`${step.message} — failed`, 1);
    clack.log.error(msg);
    ctx.markFailed(step.name);
    return false;
  }
}
