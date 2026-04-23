import { resolve, basename } from "node:path";
import { rm } from "node:fs/promises";
import { check, run, pass, fail } from "../types.js";
import type { CommandDefinition } from "../types.js";
import type { StepContext } from "../context.js";
import { fileExists } from "../fs/index.js";
import { initSteps } from "./init.js";
import { scaffoldTemplate } from "./template.js";

// ---------------------------------------------------------------------------
// Create command definition
// ---------------------------------------------------------------------------

export const createCommand: CommandDefinition = {
  description: "Create a new TSKit project",
  args: [
    { name: "directory", description: "Directory to create the project in", required: true },
  ],
  flags: [
    { name: "name", alias: "n", description: "Project name (defaults to directory name)", type: "string" },
    { name: "force", alias: "f", description: "Overwrite if directory exists", type: "boolean", default: false },
    { name: "skip-init", description: "Download only, don't run init wizard", type: "boolean", default: false },
    { name: "skip-setup", alias: "s", description: "Skip database and service setup", type: "boolean", default: false },
  ],
  steps: [
    // -- Check directory ---------------------------------------------------
    check("check-directory", {
      run: async (ctx) => {
        const dirName = ctx.arg("directory");
        if (/[^a-zA-Z0-9._-]/.test(dirName)) {
          return fail("Directory name can only contain letters, numbers, dots, hyphens, and underscores");
        }

        const dir = resolve(dirName);
        ctx.set("projectDir", dir);

        if (await fileExists(dir)) {
          if (ctx.flag("force") === true) {
            return pass(`Directory exists — will overwrite (--force)`);
          }
          return fail(`Directory "${dir}" already exists. Use --force to overwrite.`);
        }
        return pass(`Will create ${dir}`);
      },
    }),

    // -- Download and scaffold template -------------------------------------
    run("scaffold-template", {
      message: "Downloading TSKit template",
      run: async (ctx) => {
        const dir = ctx.get<string>("projectDir")!;

        // Remove existing dir if --force
        if (ctx.flag("force") === true && await fileExists(dir)) {
          await rm(dir, { recursive: true, force: true });
        }

        await scaffoldTemplate(ctx, dir);
      },
    }),

    // -- Run init steps (unless --skip-init) --------------------------------
    ...initSteps((ctx) => ctx.get<string>("projectDir")!).map((step) => {
      // Wrap each init step with a when condition to skip if --skip-init
      if ("when" in step) {
        const originalWhen = step.when;
        return {
          ...step,
          when: (ctx: StepContext) => {
            if (ctx.flag("skipInit") === true) return false;
            return originalWhen ? originalWhen(ctx) : true;
          },
        };
      }
      return {
        ...step,
        when: (ctx: StepContext) => ctx.flag("skipInit") !== true,
      };
    }),
  ],
  summary: (ctx) => {
    const dir = ctx.get<string>("projectDir")!;
    const name = ctx.get<string>("VITE_APP_NAME") ?? ctx.get<string>("projectName") ?? basename(dir);
    const dirName = basename(dir);

    if (ctx.flag("skipInit") === true) {
      const lines: string[] = [];
      lines.push(`${name} created!`);
      lines.push("");
      lines.push("  Next steps:");
      lines.push(`    cd ${dirName}`);
      lines.push("    tskit init");
      return lines.join("\n");
    }

    const unconfigured: string[] = [];
    if (!ctx.get("STRIPE_SECRET_KEY")) unconfigured.push("Stripe");
    if (!ctx.get("RESEND_API_KEY")) unconfigured.push("Resend");
    if (!ctx.get("S3_ENDPOINT")) unconfigured.push("S3 Storage");

    const lines: string[] = [];
    lines.push(`${name} is ready!`);
    lines.push("");
    lines.push("  Next steps:");
    lines.push(`    cd ${dirName}`);
    lines.push("    bun dev");

    if (unconfigured.length > 0) {
      lines.push("");
      lines.push(`  Not configured: ${unconfigured.join(", ")}`);
      lines.push("  Add the missing keys to .env when ready");
    }

    return lines.join("\n");
  },
};
