import * as clack from "@clack/prompts";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import type { StepContext } from "../context.js";
import type { StubStep } from "../types.js";
import { replacePlaceholders } from "../stubs/placeholder.js";
import { fileExists } from "../fs/index.js";

export async function handleStub(
  step: StubStep,
  ctx: StepContext,
): Promise<boolean> {
  const from = typeof step.from === "function" ? step.from(ctx) : step.from;
  const to = typeof step.to === "function" ? step.to(ctx) : step.to;
  const message = step.message ?? `Creating ${to}`;

  // Idempotency: skip if target already exists
  if (await fileExists(to)) {
    clack.log.info(`${message} (already exists)`);
    ctx.markCompleted(step.name);
    return true;
  }

  const s = clack.spinner();
  s.start(message);

  try {
    const template = await readFile(from, "utf-8");
    const content = replacePlaceholders(template, ctx);
    await mkdir(dirname(to), { recursive: true });
    await writeFile(to, content, "utf-8");
    s.stop(message, 0);
    ctx.markCompleted(step.name);
    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    s.stop(`${message} — failed`, 1);
    clack.log.error(msg);
    ctx.markFailed(step.name);
    return false;
  }
}
