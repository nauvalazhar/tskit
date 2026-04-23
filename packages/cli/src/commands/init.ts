import { resolve, basename } from "node:path";
import { readFile, readdir } from "node:fs/promises";
import { check, detect, prompt, run, pass, fail, found, notFound } from "../types.js";
import type { Step, CommandDefinition } from "../types.js";
import type { StepContext } from "../context.js";
import { fileExists, readEnv, writeEnv } from "../fs/index.js";
import type { EnvGroup } from "../fs/index.js";
import { nodeVersionCheck, bunInstalledCheck } from "../steps/common.js";
import { scaffoldTemplate } from "./template.js";

// ---------------------------------------------------------------------------
// TSKit-specific configuration
// ---------------------------------------------------------------------------

/** Marker files that identify a TSKit project */
const PROJECT_MARKERS = [
  "src/routes/__root.tsx",
  "src/lib/auth.ts",
  "src/database/schemas/billing.ts",
  "src/config/payment.ts",
];

/** All env vars with their default values */
const ENV_DEFAULTS: Record<string, string> = {
  VITE_APP_URL: "http://localhost:3000",
  VITE_APP_NAME: "TSKit",
  DATABASE_URL: "postgresql://postgres:@localhost:5432/tskit",
  BETTER_AUTH_SECRET: "",
  BETTER_AUTH_URL: "http://localhost:3000",
  EMAIL_PROVIDER: "resend",
  EMAIL_FROM: "onboarding@resend.dev",
  GITHUB_CLIENT_ID: "",
  GITHUB_CLIENT_SECRET: "",
  GOOGLE_CLIENT_ID: "",
  GOOGLE_CLIENT_SECRET: "",
  PAYMENT_PROVIDER: "stripe",
  STRIPE_SECRET_KEY: "",
  VITE_STRIPE_PUBLISHABLE_KEY: "",
  STRIPE_WEBHOOK_SECRET: "",
  RESEND_API_KEY: "",
  SENDGRID_API_KEY: "",
  POLAR_ACCESS_TOKEN: "",
  POLAR_WEBHOOK_SECRET: "",
  POLAR_SERVER: "",
  S3_ENDPOINT: "",
  S3_ACCESS_KEY_ID: "",
  S3_SECRET_ACCESS_KEY: "",
  S3_BUCKET: "",
  S3_PUBLIC_URL: "",
  S3_PRIVATE_BUCKET: "",
  VITE_STORAGE_URL: "",
};

/** How env vars are grouped in the .env file */
const ENV_GROUPS: EnvGroup[] = [
  { header: "App", keys: ["VITE_APP_URL", "VITE_APP_NAME"] },
  { header: "Database (PostgreSQL)", keys: ["DATABASE_URL"] },
  { header: "Auth (Better Auth)", keys: ["BETTER_AUTH_SECRET", "BETTER_AUTH_URL"] },
  { header: "Social Login — GitHub", keys: ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET"] },
  { header: "Social Login — Google", keys: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"] },
  { header: "Email", keys: ["EMAIL_PROVIDER", "EMAIL_FROM", "RESEND_API_KEY", "SENDGRID_API_KEY"] },
  { header: "Storage (S3-compatible)", keys: ["S3_ENDPOINT", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY", "S3_BUCKET", "S3_PRIVATE_BUCKET", "S3_PUBLIC_URL", "VITE_STORAGE_URL"] },
  { header: "Billing (Stripe)", keys: ["PAYMENT_PROVIDER", "VITE_STRIPE_PUBLISHABLE_KEY", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"] },
  { header: "Billing (Polar)", keys: ["POLAR_ACCESS_TOKEN", "POLAR_WEBHOOK_SECRET", "POLAR_SERVER"] },
];

/** Maps env var keys to auth provider names */
const PROVIDER_DETECTION: Record<string, string> = {
  GITHUB_CLIENT_ID: "github",
  GOOGLE_CLIENT_ID: "google",
};

// ---------------------------------------------------------------------------
// Init steps — reusable from create command
// ---------------------------------------------------------------------------

export function initSteps(baseGetDir: (ctx: StepContext) => string): Step[] {
  const getDir = (ctx: StepContext) => ctx.get<string>("projectDir") ?? baseGetDir(ctx);

  return [
    // -- Preflight checks --------------------------------------------------
    nodeVersionCheck(),
    bunInstalledCheck(),

    // -- Project detection -------------------------------------------------
    check("tskit-project", {
      run: async (ctx) => {
        const dir = getDir(ctx);
        const dirArg = ctx.arg("directory");

        const results = await Promise.all(
          PROJECT_MARKERS.map((m) => fileExists(resolve(dir, m))),
        );

        if (results.every(Boolean)) {
          if (dirArg && dirArg !== ".") ctx.set("projectName", basename(resolve(dirArg)));
          ctx.set("tskitProjectState", "exists");
          return pass("TSKit project detected");
        }

        const dirEntries = await readdir(dir).catch(() => []);
        const isEmpty = dirEntries.length === 0;

        if (isEmpty) {
          // Empty dir — use directory name as project name
          if (dirArg && dirArg !== ".") ctx.set("projectName", basename(resolve(dirArg)));
          ctx.set("tskitProjectState", "empty");
          return pass("Empty directory");
        }

        // Non-empty, not TSKit — don't set name, prompt for it (it's a subdirectory)
        ctx.set("tskitProjectState", "non-empty");
        return pass("No TSKit project found");
      },
    }),

    // -- Load existing .env into context -----------------------------------
    run("load-env", {
      message: "Reading existing configuration",
      when: (ctx) => ctx.get("tskitProjectState") === "exists",
      run: async (ctx) => {
        const dir = getDir(ctx);
        const env = await readEnv(dir);

        for (const [key, val] of env) {
          if (val) ctx.set(key, val);
        }

        try {
          const pkg = JSON.parse(await readFile(resolve(dir, "package.json"), "utf-8"));
          if (pkg.name) ctx.set("projectName", pkg.name);
        } catch {
          // no package.json
        }

        // Detect configured auth providers
        const providers: string[] = [];
        for (const [envKey, provider] of Object.entries(PROVIDER_DETECTION)) {
          if (env.get(envKey)) providers.push(provider);
        }
        if (providers.length > 0) ctx.set("authProviders", providers);
      },
    }),

    // -- Project name --------------------------------------------------------
    prompt("project-name", {
      message: "Project name (used as directory and package name)",
      fromFlag: "name",
      fromContext: "projectName",
      when: (ctx) => ctx.get("tskitProjectState") !== "exists",
      placeholder: "my-saas-app",
      validate: (v) => {
        if (!v.length) return "Project name is required";
        if (/[^a-zA-Z0-9._-]/.test(v)) return "Only lowercase letters, numbers, dots, hyphens, and underscores";
        return true;
      },
      set: (ctx, value) => {
        ctx.set("projectName", value);
        if (!ctx.get("VITE_APP_NAME")) ctx.set("VITE_APP_NAME", value);
        const state = ctx.get<string>("tskitProjectState");
        if (state === "non-empty") {
          ctx.set("projectDir", resolve(getDir(ctx), value as string));
        }
        ctx.set("tskitProjectState", "create");
      },
    }),

    prompt("project-name-existing", {
      message: "Project name (used as directory and package name)",
      fromFlag: "name",
      fromContext: "projectName",
      when: (ctx) => ctx.get("tskitProjectState") === "exists",
      default: (ctx) => basename(resolve(getDir(ctx))),
      set: (ctx, value) => ctx.set("projectName", value),
    }),

    prompt("app-display-name", {
      message: "App display name (shown in the UI)",
      fromContext: "VITE_APP_NAME",
      when: (ctx) => ctx.flag("skipSetup") !== true,
      default: (ctx) => ctx.get<string>("projectName") ?? "TSKit",
      set: (ctx, value) => ctx.set("VITE_APP_NAME", value),
    }),

    // -- Scaffold (if creating) --------------------------------------------
    run("scaffold-project", {
      message: "Downloading TSKit template",
      when: (ctx) => ctx.get("tskitProjectState") === "create",
      run: async (ctx) => {
        const dir = ctx.get<string>("projectDir") ?? getDir(ctx);
        await scaffoldTemplate(ctx, dir);
        ctx.set("projectDir", dir);
      },
    }),

    // -- Database ----------------------------------------------------------
    detect("database-url", {
      message: "Database URL",
      fromFlag: "database",
      when: (ctx) => ctx.flag("skipSetup") !== true,
      run: async (ctx) => {
        const url = ctx.get<string>("DATABASE_URL");
        if (url) return found(url);
        return notFound();
      },
      fallback: prompt("database-setup-method", {
        message: "How would you like to set up the database?",
        promptType: "select",
        choices: [
          "Create automatically",
          "Enter connection details",
          "Enter connection string",
        ],
        set: (ctx, value) => ctx.set("dbSetupMethod", value),
      }),
      set: (ctx, value) => {
        if (ctx.get("dbSetupMethod") === undefined) {
          ctx.set("DATABASE_URL", value);
        }
      },
    }),

    check("postgres-available", {
      run: async (ctx) => {
        const { exitCode: hasPsql } = await ctx.run("which psql");
        if (hasPsql !== 0) return fail("PostgreSQL is not installed — https://postgresql.org/download");

        const { exitCode, stdout } = await ctx.run("psql -lqt 2>&1");
        if (exitCode !== 0) {
          if (stdout.includes("password") || stdout.includes("authentication") || stdout.includes("FATAL")) {
            return fail("PostgreSQL requires authentication. Use 'Enter connection details' instead.");
          }
          if (stdout.includes("refused") || stdout.includes("No such file")) {
            return fail("PostgreSQL is not running. Start it first, then try again.");
          }
          return fail(`Cannot connect to PostgreSQL: ${stdout.split("\n")[0]}`);
        }

        return pass("PostgreSQL is running");
      },
      when: (ctx) => ctx.get("dbSetupMethod") === "Create automatically",
    }),

    check("db-not-exists-or-empty", {
      run: async (ctx) => {
        const dbName = ctx.get<string>("projectName")?.replace(/[^a-zA-Z0-9_-]/g, "_") || "tskit";
        ctx.set("dbName", dbName);

        const { exitCode } = await ctx.run(
          `psql -lqt | cut -d \\| -f 1 | grep -qw "${dbName}"`,
        );

        if (exitCode !== 0) return pass(`Database "${dbName}" will be created`);

        const { stdout: tableCount } = await ctx.run(
          `psql -tAc "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'" "${dbName}"`,
        );
        if (parseInt(tableCount, 10) > 0) {
          return fail(`Database "${dbName}" already exists and is not empty. Use a different name or drop it first:\n  dropdb "${dbName}"`);
        }

        return pass(`Database "${dbName}" exists (empty)`);
      },
      when: (ctx) => ctx.get("dbSetupMethod") === "Create automatically",
    }),

    run("create-database", {
      message: "Creating database",
      when: (ctx) => ctx.get("dbSetupMethod") === "Create automatically",
      run: async (ctx) => {
        const dbName = ctx.get<string>("dbName")!;

        const { exitCode: existsCheck } = await ctx.run(
          `psql -lqt | cut -d \\| -f 1 | grep -qw "${dbName}"`,
        );
        if (existsCheck !== 0) {
          const { exitCode, stdout } = await ctx.run(`createdb "${dbName}"`);
          if (exitCode !== 0) throw new Error(`Failed to create database "${dbName}": ${stdout}`);
        }

        ctx.set("DATABASE_URL", `postgresql://localhost:5432/${dbName}`);
      },
    }),

    prompt("db-host", {
      message: "Database host",
      default: "localhost",
      when: (ctx) => ctx.get("dbSetupMethod") === "Enter connection details",
      set: (ctx, value) => ctx.set("dbHost", value),
    }),

    prompt("db-port", {
      message: "Database port",
      default: "5432",
      when: (ctx) => ctx.get("dbSetupMethod") === "Enter connection details",
      validate: (v) => /^\d+$/.test(v) || "Must be a number",
      set: (ctx, value) => ctx.set("dbPort", value),
    }),

    prompt("db-user", {
      message: "Database user",
      default: "postgres",
      when: (ctx) => ctx.get("dbSetupMethod") === "Enter connection details",
      set: (ctx, value) => ctx.set("dbUser", value),
    }),

    prompt("db-password", {
      message: "Database password (leave empty for none)",
      default: "",
      when: (ctx) => ctx.get("dbSetupMethod") === "Enter connection details",
      set: (ctx, value) => ctx.set("dbPassword", value),
    }),

    prompt("db-name", {
      message: "Database name",
      when: (ctx) => ctx.get("dbSetupMethod") === "Enter connection details",
      default: (ctx) => ctx.get<string>("projectName")?.replace(/[^a-zA-Z0-9_-]/g, "_") || "tskit",
      set: (ctx, value) => {
        const host = ctx.get<string>("dbHost") ?? "localhost";
        const port = ctx.get<string>("dbPort") ?? "5432";
        const user = ctx.get<string>("dbUser") ?? "postgres";
        const password = ctx.get<string>("dbPassword") ?? "";
        const auth = password ? `${user}:${password}` : user;
        ctx.set("DATABASE_URL", `postgresql://${auth}@${host}:${port}/${value}`);
      },
    }),

    prompt("db-connection-string", {
      message: "PostgreSQL connection string (e.g. postgresql://user:pass@host:5432/dbname)",
      when: (ctx) => ctx.get("dbSetupMethod") === "Enter connection string",
      validate: (v) => v.startsWith("postgres") || "Must start with postgresql:// or postgres://",
      set: (ctx, value) => ctx.set("DATABASE_URL", value),
    }),

    // -- Configure services? ------------------------------------------------
    prompt("configure-now", {
      message: "Configure services now? (OAuth, Stripe, Resend, S3)",
      promptType: "confirm",
      default: "false",
      when: (ctx) => ctx.flag("skipSetup") !== true && ctx.get("tskitProjectState") !== "exists",
      set: (ctx, value) => ctx.set("configureNow", value),
    }),

    // -- OAuth providers (optional) -----------------------------------------
    prompt("auth-providers", {
      message: "OAuth providers (skip to configure later)",
      promptType: "multiselect",
      choices: ["github", "google"],
      when: (ctx) => ctx.flag("skipSetup") !== true && ctx.get("configureNow") !== false && !ctx.has("authProviders"),
      set: (ctx, value) => ctx.set("authProviders", value),
    }),

    prompt("github-client-id", {
      message: "GitHub Client ID",
      fromContext: "GITHUB_CLIENT_ID",
      when: (ctx) => (ctx.get<string[]>("authProviders") ?? []).includes("github"),
      set: (ctx, value) => ctx.set("GITHUB_CLIENT_ID", value),
    }),

    prompt("github-client-secret", {
      message: "GitHub Client Secret",
      fromContext: "GITHUB_CLIENT_SECRET",
      when: (ctx) => (ctx.get<string[]>("authProviders") ?? []).includes("github"),
      set: (ctx, value) => ctx.set("GITHUB_CLIENT_SECRET", value),
    }),

    prompt("google-client-id", {
      message: "Google Client ID",
      fromContext: "GOOGLE_CLIENT_ID",
      when: (ctx) => (ctx.get<string[]>("authProviders") ?? []).includes("google"),
      set: (ctx, value) => ctx.set("GOOGLE_CLIENT_ID", value),
    }),

    prompt("google-client-secret", {
      message: "Google Client Secret",
      fromContext: "GOOGLE_CLIENT_SECRET",
      when: (ctx) => (ctx.get<string[]>("authProviders") ?? []).includes("google"),
      set: (ctx, value) => ctx.set("GOOGLE_CLIENT_SECRET", value),
    }),

    // -- Stripe ------------------------------------------------------------
    prompt("stripe-secret-key", {
      message: "Stripe Secret Key (Enter to skip)",
      fromContext: "STRIPE_SECRET_KEY",
      when: (ctx) => ctx.flag("skipSetup") !== true && ctx.get("configureNow") !== false,
      set: (ctx, value) => { if (value) ctx.set("STRIPE_SECRET_KEY", value); },
    }),

    prompt("stripe-publishable-key", {
      message: "Stripe Publishable Key",
      fromContext: "VITE_STRIPE_PUBLISHABLE_KEY",
      when: (ctx) => !!ctx.get("STRIPE_SECRET_KEY"),
      set: (ctx, value) => ctx.set("VITE_STRIPE_PUBLISHABLE_KEY", value),
    }),

    prompt("stripe-webhook-secret", {
      message: "Stripe Webhook Secret",
      fromContext: "STRIPE_WEBHOOK_SECRET",
      when: (ctx) => !!ctx.get("STRIPE_SECRET_KEY"),
      set: (ctx, value) => ctx.set("STRIPE_WEBHOOK_SECRET", value),
    }),

    // -- Resend ------------------------------------------------------------
    prompt("resend-api-key", {
      message: "Resend API Key (Enter to skip)",
      fromContext: "RESEND_API_KEY",
      when: (ctx) => ctx.flag("skipSetup") !== true && ctx.get("configureNow") !== false,
      set: (ctx, value) => { if (value) ctx.set("RESEND_API_KEY", value); },
    }),

    prompt("email-from", {
      message: "Sender email address",
      fromContext: "EMAIL_FROM",
      default: "onboarding@resend.dev",
      when: (ctx) => !!ctx.get("RESEND_API_KEY"),
      set: (ctx, value) => ctx.set("EMAIL_FROM", value),
    }),

    // -- S3 Storage --------------------------------------------------------
    prompt("s3-endpoint", {
      message: "S3 Endpoint URL (Enter to skip)",
      fromContext: "S3_ENDPOINT",
      placeholder: "https://<account>.r2.cloudflarestorage.com",
      when: (ctx) => ctx.flag("skipSetup") !== true && ctx.get("configureNow") !== false,
      set: (ctx, value) => { if (value) ctx.set("S3_ENDPOINT", value); },
    }),

    prompt("s3-access-key-id", {
      message: "S3 Access Key ID",
      fromContext: "S3_ACCESS_KEY_ID",
      when: (ctx) => !!ctx.get("S3_ENDPOINT"),
      set: (ctx, value) => ctx.set("S3_ACCESS_KEY_ID", value),
    }),

    prompt("s3-secret-access-key", {
      message: "S3 Secret Access Key",
      fromContext: "S3_SECRET_ACCESS_KEY",
      when: (ctx) => !!ctx.get("S3_ENDPOINT"),
      set: (ctx, value) => ctx.set("S3_SECRET_ACCESS_KEY", value),
    }),

    prompt("s3-bucket", {
      message: "S3 Bucket Name",
      fromContext: "S3_BUCKET",
      when: (ctx) => !!ctx.get("S3_ENDPOINT"),
      set: (ctx, value) => ctx.set("S3_BUCKET", value),
    }),

    prompt("s3-public-url", {
      message: "S3 Public URL",
      fromContext: "S3_PUBLIC_URL",
      when: (ctx) => !!ctx.get("S3_ENDPOINT"),
      set: (ctx, value) => ctx.set("S3_PUBLIC_URL", value),
    }),

    // -- Write .env --------------------------------------------------------
    run("write-env", {
      message: "Writing .env file",
      run: async (ctx) => {
        const dir = getDir(ctx);
        const force = ctx.flag("force") === true;

        if (!ctx.get("BETTER_AUTH_SECRET")) {
          const { stdout } = await ctx.run("openssl rand -base64 32");
          ctx.set("BETTER_AUTH_SECRET", stdout || "change-me-to-a-random-secret");
        }

        if (!ctx.get("VITE_APP_NAME")) {
          ctx.set("VITE_APP_NAME", ctx.get<string>("projectName") ?? "TSKit");
        }

        const values: Record<string, string> = {};
        for (const [key, fallback] of Object.entries(ENV_DEFAULTS)) {
          values[key] = ctx.get<string>(key) ?? fallback;
        }

        await writeEnv(dir, values, {
          force,
          groups: ENV_GROUPS,
          header: "TSKit — Environment Variables",
        });
      },
    }),

    // -- Install & setup ---------------------------------------------------
    run("bun-install", {
      message: "Installing dependencies",
      run: async (ctx) => {
        const dir = getDir(ctx);
        const { exitCode, stdout } = await ctx.run("bun install", { cwd: dir });
        if (exitCode !== 0) throw new Error(stdout);
      },
    }),

    run("db-generate", {
      message: "Generating database migrations",
      when: (ctx) => ctx.flag("skipSetup") !== true,
      run: async (ctx) => {
        const dir = getDir(ctx);
        const { rm } = await import("node:fs/promises");
        await rm(resolve(dir, "src/database/migrations"), { recursive: true, force: true });
        const { exitCode, stdout } = await ctx.run("bun run --env-file .env db:generate", { cwd: dir });
        if (exitCode !== 0) throw new Error(stdout);
      },
    }),

    run("db-migrate", {
      message: "Running database migrations",
      when: (ctx) => ctx.flag("skipSetup") !== true,
      run: async (ctx) => {
        const dir = getDir(ctx);
        const { exitCode, stdout } = await ctx.run("bun run --env-file .env db:migrate", { cwd: dir });
        if (exitCode !== 0) {
          if (stdout.includes("already exists")) {
            ctx.log("Some tables already exist — drop and recreate the database for a clean migration, or run migrations manually.");
          }
          throw new Error(stdout);
        }
      },
    }),

    run("db-seed", {
      message: "Seeding database",
      when: (ctx) => ctx.flag("skipSetup") !== true,
      run: async (ctx) => {
        const dir = getDir(ctx);
        const { exitCode, stdout } = await ctx.run("bun run --env-file .env db:seed", { cwd: dir });
        if (exitCode !== 0) throw new Error(stdout);
      },
    }),
  ];
}

// ---------------------------------------------------------------------------
// Init command definition
// ---------------------------------------------------------------------------

export const initCommand: CommandDefinition = {
  description: "Interactive setup wizard for a TSKit project",
  args: [
    { name: "directory", description: "Project directory", default: "." },
  ],
  flags: [
    { name: "name", alias: "n", description: "Project name", type: "string" },
    { name: "database", alias: "d", description: "Database URL", type: "string" },
    { name: "force", alias: "f", description: "Re-prompt and overwrite everything", type: "boolean", default: false },
    { name: "skip-setup", alias: "s", description: "Skip database and service setup", type: "boolean", default: false },
  ],
  steps: initSteps((ctx) => resolve(ctx.arg("directory") || ".")),
  summary: (ctx) => {
    const name = ctx.get<string>("VITE_APP_NAME") ?? ctx.get<string>("projectName") ?? "TSKit";
    const dir = ctx.get<string>("projectDir");
    const cwd = resolve(".");
    const needsCd = dir && resolve(dir) !== cwd;
    const dirName = dir ? basename(resolve(dir)) : null;

    const lines: string[] = [];

    if (ctx.flag("skipSetup") === true) {
      lines.push(`${name} downloaded!`);
      lines.push("");
      lines.push("  Next steps:");
      if (needsCd) lines.push(`    cd ${dirName}`);
      lines.push("    edit .env                # add DATABASE_URL and service keys");
      lines.push("    bun run db:generate");
      lines.push("    bun run db:migrate");
      lines.push("    bun run db:seed");
      lines.push("    bun dev");
      return lines.join("\n");
    }

    const unconfigured: string[] = [];
    if (!ctx.get("STRIPE_SECRET_KEY")) unconfigured.push("Stripe");
    if (!ctx.get("RESEND_API_KEY")) unconfigured.push("Resend");
    if (!ctx.get("S3_ENDPOINT")) unconfigured.push("S3 Storage");

    lines.push(`${name} is ready!`);
    lines.push("");
    lines.push("  Next steps:");
    if (needsCd) {
      lines.push(`    cd ${dirName}`);
    }
    lines.push("    bun dev");

    if (unconfigured.length > 0) {
      lines.push("");
      lines.push(`  Not configured: ${unconfigured.join(", ")}`);
      lines.push("  Add the missing keys to .env when ready");
    }

    return lines.join("\n");
  },
};
