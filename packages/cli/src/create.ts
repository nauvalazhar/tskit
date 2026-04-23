#!/usr/bin/env node

/**
 * Entry point for `bunx create-tskit` / `pnpm create tskit`.
 * Maps `create-tskit <dir> [flags]` → `tskit create <dir> [flags]`.
 */

import { Command } from "commander";
import * as clack from "@clack/prompts";
import { StepContext } from "./context.js";
import { runPipeline } from "./runner.js";
import { createCommand } from "./commands/create.js";

const program = new Command();
program
  .name("create-tskit")
  .description("Create a new TSKit project")
  .version("0.1.0");

let cmd = program.argument("<directory>", "Directory to create the project in");
cmd = cmd.option("--no-interactive", "Run without prompts, fail if values are missing");

for (const flag of createCommand.flags ?? []) {
  const long = flag.type === "boolean" ? `--${flag.name}` : `--${flag.name} <value>`;
  const short = flag.alias ? `-${flag.alias}, ` : "";
  cmd = cmd.option(`${short}${long}`, flag.description ?? "", flag.default);
}

cmd.action(async (directory: string, opts: Record<string, string | boolean>) => {
  const ctx = new StepContext({ directory }, opts);

  clack.intro("create-tskit");

  const success = await runPipeline(createCommand.steps, ctx);

  if (success && createCommand.summary) {
    clack.outro(createCommand.summary(ctx));
  } else if (success) {
    clack.outro("Done.");
  } else {
    process.exit(1);
  }
});

program.parse();
