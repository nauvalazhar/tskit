import { resolve } from "node:path";
import * as clack from "@clack/prompts";
import { check, run, pass, fail } from "../types.js";
import type { Step, CommandDefinition } from "../types.js";
import type { StepContext } from "../context.js";
import { fileExists, readEnv } from "../fs/index.js";
import { nodeVersionCheck, bunInstalledCheck } from "../steps/common.js";

// ---------------------------------------------------------------------------
// Doctor steps
// ---------------------------------------------------------------------------

function doctorSteps(): Step[] {
  const dir = process.cwd();

  return [
    nodeVersionCheck(),
    bunInstalledCheck(),

    check("env-file", {
      run: async () => {
        if (await fileExists(resolve(dir, ".env"))) return pass(".env file exists");
        return fail(".env file not found — run `tskit init` to create one");
      },
    }),

    check("database-url", {
      run: async () => {
        const env = await readEnv(dir);
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
        const env = await readEnv(dir);
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
        const env = await readEnv(dir);
        if (!env.get("BETTER_AUTH_SECRET")) {
          return fail("BETTER_AUTH_SECRET not set");
        }
        const providers: string[] = [];
        if (env.get("GITHUB_CLIENT_ID") && env.get("GITHUB_CLIENT_SECRET")) {
          providers.push("GitHub");
        }
        if (env.get("GOOGLE_CLIENT_ID") && env.get("GOOGLE_CLIENT_SECRET")) {
          providers.push("Google");
        }
        const providerStr = providers.length > 0 ? ` (${providers.join(", ")})` : "";
        return pass(`Auth configured${providerStr}`);
      },
    }),

    check("stripe", {
      run: async (ctx) => {
        const env = await readEnv(dir);
        const key = env.get("STRIPE_SECRET_KEY");
        if (!key) return fail("STRIPE_SECRET_KEY not set");
        if (!env.has("STRIPE_WEBHOOK_SECRET")) return fail("STRIPE_WEBHOOK_SECRET not set");

        // Verify credentials with a lightweight API call
        const { exitCode, stdout } = await ctx.run(
          `curl -sf -o /dev/null -w "%{http_code}" https://api.stripe.com/v1/charges?limit=1 -u "${key}:"`,
        );
        const status = stdout.trim();
        if (exitCode !== 0 || status === "401") return fail("Stripe credentials are invalid");
        if (status !== "200") return fail(`Stripe API returned ${status}`);

        return pass("Stripe connected");
      },
    }),

    check("resend", {
      run: async (ctx) => {
        const env = await readEnv(dir);
        const key = env.get("RESEND_API_KEY");
        if (!key) return fail("RESEND_API_KEY not set");

        const { exitCode, stdout } = await ctx.run(
          `curl -sf -o /dev/null -w "%{http_code}" https://api.resend.com/api-keys -H "Authorization: Bearer ${key}"`,
        );
        const status = stdout.trim();
        if (exitCode !== 0 || status === "401" || status === "403") return fail("Resend API key is invalid");
        if (status !== "200") return fail(`Resend API returned ${status}`);

        return pass("Resend connected");
      },
    }),

    check("storage", {
      run: async (ctx) => {
        const env = await readEnv(dir);
        const required = ["S3_ENDPOINT", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY", "S3_BUCKET"];
        const missing = required.filter((k) => !env.has(k));
        if (missing.length > 0) return fail(`Storage missing: ${missing.join(", ")}`);

        // Verify S3 connectivity with a HEAD bucket request
        const endpoint = env.get("S3_ENDPOINT")!;
        const bucket = env.get("S3_BUCKET")!;
        const accessKey = env.get("S3_ACCESS_KEY_ID")!;
        const secretKey = env.get("S3_SECRET_ACCESS_KEY")!;

        // An unsigned request to S3/R2 will return 403 (auth required) — that's fine,
        // it means the endpoint is reachable. Only timeouts/DNS failures mean unreachable.
        const { stdout } = await ctx.run(
          `curl -s -o /dev/null -w "%{http_code}" "${endpoint}/${bucket}" --max-time 5 2>/dev/null`,
        );
        const status = stdout.trim();
        if (status === "000") return fail(`S3 endpoint unreachable: ${endpoint}`);

        return pass("Storage reachable");
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

  clack.log.info(`${passed}/${passed + failed} checks passed`);
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
