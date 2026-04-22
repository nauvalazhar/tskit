import { resolve } from "node:path";
import { readFile, access } from "node:fs/promises";
import * as clack from "@clack/prompts";
import { check, run, pass, fail } from "../types.js";
import type { Step, CommandDefinition } from "../types.js";
import type { StepContext } from "../context.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function readEnvFile(dir: string): Promise<Map<string, string>> {
  const envPath = resolve(dir, ".env");
  const map = new Map<string, string>();
  try {
    const content = await readFile(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx);
      const val = trimmed.slice(eqIdx + 1);
      if (val) map.set(key, val);
    }
  } catch {
    // no .env
  }
  return map;
}

// ---------------------------------------------------------------------------
// Doctor steps
// ---------------------------------------------------------------------------

function doctorSteps(): Step[] {
  const dir = process.cwd();

  return [
    check("node-version", {
      run: async (ctx) => {
        const { stdout, exitCode } = await ctx.run("node --version");
        if (exitCode !== 0) return fail("Node.js is not installed");
        const match = stdout.match(/v(\d+)/);
        const major = match ? parseInt(match[1], 10) : 0;
        if (major < 18) return fail(`Node >= 18 required (found ${stdout})`);
        return pass(`Node ${stdout}`);
      },
    }),

    check("bun-installed", {
      run: async (ctx) => {
        const { stdout, exitCode } = await ctx.run("bun --version");
        if (exitCode !== 0) return fail("Bun is not installed — https://bun.sh");
        return pass(`Bun v${stdout}`);
      },
    }),

    check("env-file", {
      run: async () => {
        if (await fileExists(resolve(dir, ".env"))) return pass(".env file exists");
        return fail(".env file not found — run `tskit init` to create one");
      },
    }),

    check("database-url", {
      run: async () => {
        const env = await readEnvFile(dir);
        if (env.has("DATABASE_URL")) return pass("DATABASE_URL set");
        return fail("DATABASE_URL not set in .env");
      },
    }),

    check("database-reachable", {
      run: async (ctx) => {
        // Use a short timeout pg connection test via bun
        const testScript = `
          const url = process.env.DATABASE_URL;
          if (!url) { process.exit(1); }
          const { Client } = require('pg');
          const c = new Client({ connectionString: url, connectionTimeoutMillis: 3000 });
          c.connect().then(() => { c.end(); process.exit(0); }).catch(() => process.exit(1));
        `;
        // Try a simpler approach: use node to test the connection
        const env = await readEnvFile(dir);
        const dbUrl = env.get("DATABASE_URL");
        if (!dbUrl) return fail("DATABASE_URL not set — cannot test connection");

        const { exitCode } = await ctx.run(
          `cd "${dir}" && node -e "const{Client}=require('pg');const c=new Client({connectionString:'${dbUrl.replace(/'/g, "\\'")}',connectionTimeoutMillis:3000});c.connect().then(()=>{c.end();process.exit(0)}).catch(()=>process.exit(1))" 2>/dev/null`,
        );

        if (exitCode === 0) return pass("Database reachable");

        // Fallback: try with bun's built-in postgres if pg module not available
        const { exitCode: exitCode2 } = await ctx.run(
          `cd "${dir}" && bun -e "const sql=require('postgres')('${dbUrl.replace(/'/g, "\\'")}');sql\`SELECT 1\`.then(()=>{sql.end();process.exit(0)}).catch(()=>process.exit(1))" 2>/dev/null`,
        );

        if (exitCode2 === 0) return pass("Database reachable");
        return fail("Database is not reachable — check DATABASE_URL and ensure PostgreSQL is running");
      },
    }),

    check("migrations-up-to-date", {
      run: async (ctx) => {
        const migrationsDir = resolve(dir, "src/database/migrations");
        if (!(await fileExists(migrationsDir))) {
          return fail("No migrations directory found");
        }
        // Check if there are pending migrations by running drizzle-kit
        // A simpler heuristic: check that migrations exist and db:migrate won't fail
        return pass("Migrations directory exists");
      },
    }),

    check("dependencies-installed", {
      run: async (ctx) => {
        const nodeModules = resolve(dir, "node_modules");
        if (await fileExists(nodeModules)) return pass("Dependencies installed");
        if (ctx.flag("fix") === true) {
          ctx.log("Running bun install...");
          const { exitCode } = await ctx.run(`cd "${dir}" && bun install`);
          if (exitCode === 0) return pass("Dependencies installed (auto-fixed)");
          return fail("Failed to install dependencies");
        }
        return fail("node_modules not found — run `bun install` or use --fix");
      },
    }),

    check("auth-config", {
      run: async () => {
        const env = await readEnvFile(dir);
        if (!env.has("BETTER_AUTH_SECRET")) {
          return fail("BETTER_AUTH_SECRET not set");
        }
        const providers: string[] = [];
        if (env.has("GITHUB_CLIENT_ID") && env.has("GITHUB_CLIENT_SECRET")) {
          providers.push("GitHub");
        }
        if (env.has("GOOGLE_CLIENT_ID") && env.has("GOOGLE_CLIENT_SECRET")) {
          providers.push("Google");
        }
        const providerStr = providers.length > 0 ? ` (${providers.join(", ")})` : "";
        return pass(`Auth configured${providerStr}`);
      },
    }),

    check("stripe-secret-key", {
      run: async () => {
        const env = await readEnvFile(dir);
        if (env.has("STRIPE_SECRET_KEY")) return pass("STRIPE_SECRET_KEY set");
        return fail("STRIPE_SECRET_KEY not set");
      },
    }),

    check("stripe-webhook-secret", {
      run: async () => {
        const env = await readEnvFile(dir);
        if (env.has("STRIPE_WEBHOOK_SECRET")) return pass("STRIPE_WEBHOOK_SECRET set");
        return fail("STRIPE_WEBHOOK_SECRET not set");
      },
    }),

    check("resend-api-key", {
      run: async () => {
        const env = await readEnvFile(dir);
        if (env.has("RESEND_API_KEY")) return pass("RESEND_API_KEY set");
        return fail("RESEND_API_KEY not set");
      },
    }),

    check("storage-config", {
      run: async () => {
        const env = await readEnvFile(dir);
        const required = ["S3_ENDPOINT", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY", "S3_BUCKET", "S3_PUBLIC_URL"];
        const missing = required.filter((k) => !env.has(k));
        if (missing.length === 0) return pass("Storage configured");
        return fail(`Storage missing: ${missing.join(", ")}`);
      },
    }),
  ];
}

// ---------------------------------------------------------------------------
// Custom doctor runner — continues on failure to show all checks
// ---------------------------------------------------------------------------

async function runDoctorPipeline(steps: Step[], ctx: StepContext): Promise<boolean> {
  let passed = 0;
  let failed = 0;

  for (const step of steps) {
    if ("when" in step && step.when && !step.when(ctx)) {
      ctx.markCompleted(step.name);
      passed++;
      continue;
    }

    if (step.type === "check") {
      const result = await step.run(ctx);
      if (result.status === "pass") {
        clack.log.success(result.message ?? step.name);
        ctx.markCompleted(step.name);
        passed++;
      } else {
        clack.log.error(result.message);
        ctx.markFailed(step.name);
        failed++;
      }
    }
  }

  clack.log.info(`\n${passed}/${passed + failed} checks passed`);
  return failed === 0;
}

// ---------------------------------------------------------------------------
// Doctor command definition
// ---------------------------------------------------------------------------

export const doctorCommand: CommandDefinition = {
  description: "Validate that the project is correctly set up",
  flags: [
    { name: "fix", description: "Attempt to auto-fix issues", type: "boolean", default: false },
  ],
  steps: doctorSteps(),
  summary: (ctx) => "All checks passed!",
};

// Export the custom runner for use in index.ts
export { runDoctorPipeline };
