#!/usr/bin/env node

import { Command } from "commander";
import * as clack from "@clack/prompts";
import { StepContext } from "./context.js";
import { runPipeline } from "./runner.js";
import type { CommandDefinition } from "./types.js";
import { initCommand } from "./commands/init.js";
import { createCommand } from "./commands/create.js";
import { doctorCommand, runDoctorPipeline } from "./commands/doctor.js";

// Re-export public API
export { StepContext } from "./context.js";
export { runPipeline } from "./runner.js";
export {
  check,
  detect,
  prompt,
  run,
  stub,
  pass,
  fail,
  found,
  notFound,
  defineConfig,
} from "./types.js";
export type {
  Step,
  CheckStep,
  DetectStep,
  PromptStep,
  RunStep,
  StubStep,
  PassResult,
  FailResult,
  FoundResult,
  NotFoundResult,
  CommandDefinition,
  ArgDefinition,
  FlagDefinition,
  TSKitConfig,
} from "./types.js";
export { file, json, fileExists, readEnv, writeEnv } from "./fs/index.js";
export type { EnvGroup } from "./fs/index.js";
export { replacePlaceholders } from "./stubs/placeholder.js";
export { nodeVersionCheck, bunInstalledCheck } from "./steps/common.js";
export {
  markerExists,
  createMarker,
  clearMarkers,
} from "./utils/idempotency.js";

// ---------------------------------------------------------------------------
// Commands that need custom pipeline runners
// ---------------------------------------------------------------------------

const CUSTOM_RUNNERS: Record<
  string,
  (steps: import("./types.js").Step[], ctx: StepContext) => Promise<boolean>
> = {
  doctor: runDoctorPipeline,
};

// ---------------------------------------------------------------------------
// Built-in commands
// ---------------------------------------------------------------------------

const builtinCommands: Record<string, CommandDefinition> = {
  create: createCommand,
  init: initCommand,
  doctor: doctorCommand,
};

// ---------------------------------------------------------------------------
// CLI setup
// ---------------------------------------------------------------------------

function buildCLI(commands: Record<string, CommandDefinition>): Command {
  const program = new Command();
  program
    .name("tskit")
    .description("TSKit CLI — TanStack Start tooling")
    .version("0.1.0");

  for (const [name, def] of Object.entries(commands)) {
    let cmd = program.command(name).description(def.description);

    // Register args
    if (def.args) {
      for (const arg of def.args) {
        const bracket = arg.required ? `<${arg.name}>` : `[${arg.name}]`;
        cmd = cmd.argument(bracket, arg.description ?? "", arg.default);
      }
    }

    // Built-in flags
    cmd = cmd.option("--no-interactive", "Run without prompts, fail if values are missing");

    // Register command flags
    if (def.flags) {
      for (const flag of def.flags) {
        const long =
          flag.type === "boolean" ? `--${flag.name}` : `--${flag.name} <value>`;
        const short = flag.alias ? `-${flag.alias}, ` : "";
        cmd = cmd.option(
          `${short}${long}`,
          flag.description ?? "",
          flag.default,
        );
      }
    }

    cmd.action(async (...actionArgs: unknown[]) => {
      // Parse args into a record
      const parsedArgs: Record<string, string> = {};
      if (def.args) {
        for (let i = 0; i < def.args.length; i++) {
          const val = actionArgs[i];
          if (typeof val === "string") {
            parsedArgs[def.args[i].name] = val;
          }
        }
      }

      // The last arg before Command is the options object
      const cmdInstance = actionArgs[actionArgs.length - 1] as Command;
      const opts = cmdInstance.opts() as Record<string, string | boolean>;

      const ctx = new StepContext(parsedArgs, opts);

      clack.intro(`tskit ${name}`);

      // Use custom runner if available, otherwise default pipeline
      const runner = CUSTOM_RUNNERS[name] ?? runPipeline;
      const success = await runner(def.steps, ctx);

      if (success && def.summary) {
        clack.outro(def.summary(ctx));
      } else if (success) {
        clack.outro("Done.");
      } else if (ctx.isCancelled) {
        process.exit(0);
      } else {
        if (name !== "doctor") {
          process.exit(1);
        } else {
          clack.outro("Some checks failed.");
          process.exit(1);
        }
      }
    });
  }

  return program;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const program = buildCLI(builtinCommands);
program.parse();
