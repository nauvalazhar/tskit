import { resolve, basename } from "node:path";
import { readFile, writeFile, access, readdir } from "node:fs/promises";
import { check, detect, prompt, run, pass, fail, found, notFound } from "../types.js";
import type { Step, CommandDefinition } from "../types.js";
import type { StepContext } from "../context.js";
import { scaffoldTemplate } from "./template.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function envLine(key: string, value: string): string {
  return `${key}=${value}`;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Reads existing .env and returns a Map of key → value.
 */
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
      map.set(trimmed.slice(0, eqIdx), trimmed.slice(eqIdx + 1));
    }
  } catch {
    // no .env yet
  }
  return map;
}

/**
 * Writes .env file, merging new values with existing ones.
 * Existing values are NOT overwritten unless --force is set.
 */
async function writeEnvFile(
  dir: string,
  values: Record<string, string>,
  force: boolean,
): Promise<void> {
  const envPath = resolve(dir, ".env");
  const existing = await readEnvFile(dir);

  // Merge: new values fill gaps, force overwrites all
  for (const [key, val] of Object.entries(values)) {
    if (force || !existing.has(key)) {
      existing.set(key, val);
    }
  }

  // Group output by domain for readability
  const groups: { header: string; keys: string[] }[] = [
    { header: "App", keys: ["VITE_APP_URL", "VITE_APP_NAME"] },
    { header: "Database (PostgreSQL)", keys: ["DATABASE_URL"] },
    { header: "Auth (Better Auth)", keys: ["BETTER_AUTH_SECRET", "BETTER_AUTH_URL"] },
    { header: "Social Login — GitHub", keys: ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET"] },
    { header: "Social Login — Google", keys: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"] },
    { header: "Email", keys: ["EMAIL_PROVIDER", "EMAIL_FROM", "RESEND_API_KEY", "SENDGRID_API_KEY"] },
    { header: "Storage (S3-compatible)", keys: ["S3_ENDPOINT", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY", "S3_BUCKET", "S3_PRIVATE_BUCKET", "S3_PUBLIC_URL", "VITE_STORAGE_URL"] },
    { header: "Billing (Stripe)", keys: ["PAYMENT_PROVIDER", "VITE_STRIPE_PUBLISHABLE_KEY", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"] },
  ];

  const lines: string[] = [
    "# =============================================================================",
    "# TSKit — Environment Variables",
    "# =============================================================================",
    "",
  ];

  const written = new Set<string>();

  for (const group of groups) {
    const groupLines: string[] = [];
    for (const key of group.keys) {
      if (existing.has(key)) {
        groupLines.push(envLine(key, existing.get(key)!));
        written.add(key);
      }
    }
    if (groupLines.length > 0) {
      lines.push(`# --- ${group.header} ---`);
      lines.push(...groupLines);
      lines.push("");
    }
  }

  // Any remaining keys not in groups
  for (const [key, val] of existing) {
    if (!written.has(key)) {
      lines.push(envLine(key, val));
    }
  }

  lines.push(""); // trailing newline
  await writeFile(envPath, lines.join("\n"), "utf-8");
}

// ---------------------------------------------------------------------------
// Init steps — reusable from create command
// ---------------------------------------------------------------------------

export function initSteps(baseGetDir: (ctx: StepContext) => string): Step[] {
  // Once scaffold sets projectDir, use that for all remaining steps
  const getDir = (ctx: StepContext) => ctx.get<string>("projectDir") ?? baseGetDir(ctx);

  return [
    // -- Preflight checks --------------------------------------------------
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

    check("tskit-project", {
      run: async (ctx) => {
        const dir = getDir(ctx);

        // TSKit-specific markers — a combination that only exists in a TSKit project
        const markers = [
          "src/routes/__root.tsx",
          "src/lib/auth.ts",
          "src/database/schemas/billing.ts",
          "src/config/payment.ts",
        ];

        const results = await Promise.all(
          markers.map((m) => fileExists(resolve(dir, m))),
        );

        if (results.every(Boolean)) {
          ctx.set("tskitProjectState", "exists");
          return pass("TSKit project detected");
        }

        // Not a TSKit project — check if directory is empty
        const dirEntries = await readdir(dir).catch(() => []);
        const isEmpty = dirEntries.length === 0;
        ctx.set("tskitProjectState", isEmpty ? "empty" : "non-empty");
        return pass(isEmpty ? "Empty directory" : "No TSKit project found");
      },
    }),

    // Empty dir → ask to create here
    prompt("create-here-prompt", {
      message: "No TSKit project found. Create one here?",
      promptType: "confirm",
      when: (ctx) => ctx.get<string>("tskitProjectState") === "empty",
      set: (ctx, value) => {
        ctx.set("tskitProjectState", value ? "create" : "declined");
      },
    }),

    // Non-empty dir → ask for a subdirectory name
    prompt("create-subdir-prompt", {
      message: "No TSKit project found. Enter a directory name to create one",
      when: (ctx) => ctx.get<string>("tskitProjectState") === "non-empty",
      default: "my-app",
      validate: (v) => {
        if (!v.length) return "Directory name is required";
        if (/[^a-zA-Z0-9._-]/.test(v)) return "Only letters, numbers, dots, hyphens, and underscores allowed";
        return true;
      },
      set: (ctx, value) => {
        const dir = getDir(ctx);
        ctx.set("projectDir", resolve(dir, value as string));
        ctx.set("tskitProjectState", "create");
      },
    }),

    check("create-project-confirm", {
      run: async (ctx) => {
        const state = ctx.get<string>("tskitProjectState");
        if (state === "exists" || state === "create") return pass();
        return fail("Run `tskit create <directory>` to start a new project.");
      },
      when: (ctx) => ctx.get<string>("tskitProjectState") !== "exists",
    }),

    run("scaffold-project", {
      message: "Downloading TSKit template",
      when: (ctx) => ctx.get<string>("tskitProjectState") === "create",
      run: async (ctx) => {
        // Use projectDir if set (subdirectory case), otherwise the original dir
        const dir = ctx.get<string>("projectDir") ?? getDir(ctx);
        await scaffoldTemplate(ctx, dir);
        // Update getDir to point at the new project for remaining steps
        ctx.set("projectDir", dir);
      },
    }),

    // -- Project name ------------------------------------------------------
    prompt("project-name", {
      message: "Project name",
      fromFlag: "name",
      default: (ctx) => basename(resolve(getDir(ctx))),
      set: (ctx, value) => ctx.set("projectName", value),
    }),

    // -- Database ----------------------------------------------------------
    detect("database-url", {
      message: "Database URL",
      fromFlag: "database",
      run: async (ctx) => {
        const dir = getDir(ctx);
        const env = await readEnvFile(dir);
        const url = env.get("DATABASE_URL") || process.env.DATABASE_URL;
        if (url && url !== "postgresql://postgres:@localhost:5432/tskit") {
          return found(url);
        }
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
        // If detect found a URL, store it directly
        if (ctx.get("dbSetupMethod") === undefined) {
          ctx.set("databaseUrl", value);
        }
      },
    }),

    // Auto-create: detect local Postgres and create the database
    run("db-auto-create", {
      message: "Creating database",
      when: (ctx) => ctx.get<string>("dbSetupMethod") === "Create automatically",
      run: async (ctx) => {
        const dbName = ctx.get<string>("projectName")?.replace(/[^a-zA-Z0-9_-]/g, "_") || "tskit";

        // Check if createdb is available (Postgres is installed)
        const { exitCode: pgCheck } = await ctx.run("which createdb");
        if (pgCheck !== 0) {
          throw new Error(
            "PostgreSQL client tools not found. Install PostgreSQL or choose 'Enter connection details' instead.",
          );
        }

        // Try to create the database (ignore error if it already exists)
        const { exitCode, stdout } = await ctx.run(`createdb "${dbName}" 2>&1`);
        if (exitCode !== 0 && !stdout.includes("already exists")) {
          throw new Error(`Failed to create database: ${stdout}`);
        }

        const url = `postgresql://localhost:5432/${dbName}`;
        ctx.set("databaseUrl", url);
      },
    }),

    // Enter details: prompt for host, port, user, password, db name
    prompt("db-host", {
      message: "Database host",
      default: "localhost",
      when: (ctx) => ctx.get<string>("dbSetupMethod") === "Enter connection details",
      set: (ctx, value) => ctx.set("dbHost", value),
    }),

    prompt("db-port", {
      message: "Database port",
      default: "5432",
      when: (ctx) => ctx.get<string>("dbSetupMethod") === "Enter connection details",
      validate: (v) => /^\d+$/.test(v) || "Must be a number",
      set: (ctx, value) => ctx.set("dbPort", value),
    }),

    prompt("db-user", {
      message: "Database user",
      default: "postgres",
      when: (ctx) => ctx.get<string>("dbSetupMethod") === "Enter connection details",
      set: (ctx, value) => ctx.set("dbUser", value),
    }),

    prompt("db-password", {
      message: "Database password (leave empty for none)",
      default: "",
      when: (ctx) => ctx.get<string>("dbSetupMethod") === "Enter connection details",
      set: (ctx, value) => ctx.set("dbPassword", value),
    }),

    prompt("db-name", {
      message: "Database name",
      when: (ctx) => ctx.get<string>("dbSetupMethod") === "Enter connection details",
      default: (ctx) => ctx.get<string>("projectName")?.replace(/[^a-zA-Z0-9_-]/g, "_") || "tskit",
      set: (ctx, value) => {
        ctx.set("dbName", value);
        const host = ctx.get<string>("dbHost") ?? "localhost";
        const port = ctx.get<string>("dbPort") ?? "5432";
        const user = ctx.get<string>("dbUser") ?? "postgres";
        const password = ctx.get<string>("dbPassword") ?? "";
        const auth = password ? `${user}:${password}` : user;
        ctx.set("databaseUrl", `postgresql://${auth}@${host}:${port}/${value}`);
      },
    }),

    // Enter connection string: raw URL for advanced users
    prompt("db-connection-string", {
      message: "PostgreSQL connection string (e.g. postgresql://user:pass@host:5432/dbname)",
      when: (ctx) => ctx.get<string>("dbSetupMethod") === "Enter connection string",
      validate: (v) => v.startsWith("postgres") || "Must start with postgresql:// or postgres://",
      set: (ctx, value) => ctx.set("databaseUrl", value),
    }),

    // -- Auth providers ----------------------------------------------------
    prompt("auth-providers", {
      message: "Which OAuth providers would you like to enable?",
      promptType: "multiselect",
      choices: ["github", "google"],
      set: (ctx, value) => ctx.set("authProviders", value),
    }),

    // GitHub credentials (conditional)
    prompt("github-client-id", {
      message: "GitHub Client ID",
      env: "GITHUB_CLIENT_ID",
      when: (ctx) => {
        const providers = ctx.get<string[]>("authProviders") ?? [];
        return providers.includes("github");
      },
      set: (ctx, value) => ctx.set("githubClientId", value),
    }),

    prompt("github-client-secret", {
      message: "GitHub Client Secret",
      env: "GITHUB_CLIENT_SECRET",
      when: (ctx) => {
        const providers = ctx.get<string[]>("authProviders") ?? [];
        return providers.includes("github");
      },
      set: (ctx, value) => ctx.set("githubClientSecret", value),
    }),

    // Google credentials (conditional)
    prompt("google-client-id", {
      message: "Google Client ID",
      env: "GOOGLE_CLIENT_ID",
      when: (ctx) => {
        const providers = ctx.get<string[]>("authProviders") ?? [];
        return providers.includes("google");
      },
      set: (ctx, value) => ctx.set("googleClientId", value),
    }),

    prompt("google-client-secret", {
      message: "Google Client Secret",
      env: "GOOGLE_CLIENT_SECRET",
      when: (ctx) => {
        const providers = ctx.get<string[]>("authProviders") ?? [];
        return providers.includes("google");
      },
      set: (ctx, value) => ctx.set("googleClientSecret", value),
    }),

    // -- Billing -----------------------------------------------------------
    prompt("enable-billing", {
      message: "Enable Stripe billing?",
      promptType: "confirm",
      set: (ctx, value) => ctx.set("enableBilling", value),
    }),

    prompt("stripe-secret-key", {
      message: "Stripe Secret Key",
      env: "STRIPE_SECRET_KEY",
      when: (ctx) => ctx.get<boolean>("enableBilling") === true,
      set: (ctx, value) => ctx.set("stripeSecretKey", value),
    }),

    prompt("stripe-publishable-key", {
      message: "Stripe Publishable Key",
      env: "VITE_STRIPE_PUBLISHABLE_KEY",
      when: (ctx) => ctx.get<boolean>("enableBilling") === true,
      set: (ctx, value) => ctx.set("stripePublishableKey", value),
    }),

    prompt("stripe-webhook-secret", {
      message: "Stripe Webhook Secret",
      env: "STRIPE_WEBHOOK_SECRET",
      when: (ctx) => ctx.get<boolean>("enableBilling") === true,
      set: (ctx, value) => ctx.set("stripeWebhookSecret", value),
    }),

    // -- Email -------------------------------------------------------------
    prompt("resend-api-key", {
      message: "Resend API Key",
      env: "RESEND_API_KEY",
      set: (ctx, value) => ctx.set("resendApiKey", value),
    }),

    prompt("email-from", {
      message: "Sender email address",
      env: "EMAIL_FROM",
      default: "onboarding@resend.dev",
      set: (ctx, value) => ctx.set("emailFrom", value),
    }),

    // -- Storage -----------------------------------------------------------
    prompt("s3-endpoint", {
      message: "S3 Endpoint URL (e.g. https://<account>.r2.cloudflarestorage.com)",
      env: "S3_ENDPOINT",
      set: (ctx, value) => ctx.set("s3Endpoint", value),
    }),

    prompt("s3-access-key-id", {
      message: "S3 Access Key ID",
      env: "S3_ACCESS_KEY_ID",
      set: (ctx, value) => ctx.set("s3AccessKeyId", value),
    }),

    prompt("s3-secret-access-key", {
      message: "S3 Secret Access Key",
      env: "S3_SECRET_ACCESS_KEY",
      set: (ctx, value) => ctx.set("s3SecretAccessKey", value),
    }),

    prompt("s3-bucket", {
      message: "S3 Bucket Name",
      env: "S3_BUCKET",
      set: (ctx, value) => ctx.set("s3Bucket", value),
    }),

    prompt("s3-public-url", {
      message: "S3 Public URL",
      env: "S3_PUBLIC_URL",
      set: (ctx, value) => ctx.set("s3PublicUrl", value),
    }),

    // -- Write .env --------------------------------------------------------
    run("write-env", {
      message: "Writing .env file",
      run: async (ctx) => {
        const dir = getDir(ctx);
        const force = ctx.flag("force") === true;

        // Generate a random auth secret
        const { stdout: authSecret } = await ctx.run("openssl rand -base64 32");

        const values: Record<string, string> = {
          VITE_APP_URL: "http://localhost:3000",
          VITE_APP_NAME: (ctx.get<string>("projectName") ?? "TSKit"),
          DATABASE_URL: (ctx.get<string>("databaseUrl") ?? "postgresql://postgres:@localhost:5432/tskit"),
          BETTER_AUTH_SECRET: authSecret || "change-me-to-a-random-secret",
          BETTER_AUTH_URL: "http://localhost:3000",
          EMAIL_PROVIDER: "resend",
          EMAIL_FROM: (ctx.get<string>("emailFrom") ?? "onboarding@resend.dev"),
        };

        // Auth providers
        const providers = ctx.get<string[]>("authProviders") ?? [];
        if (providers.includes("github")) {
          values.GITHUB_CLIENT_ID = (ctx.get<string>("githubClientId") ?? "");
          values.GITHUB_CLIENT_SECRET = (ctx.get<string>("githubClientSecret") ?? "");
        }
        if (providers.includes("google")) {
          values.GOOGLE_CLIENT_ID = (ctx.get<string>("googleClientId") ?? "");
          values.GOOGLE_CLIENT_SECRET = (ctx.get<string>("googleClientSecret") ?? "");
        }

        // Billing
        if (ctx.get<boolean>("enableBilling")) {
          values.PAYMENT_PROVIDER = "stripe";
          values.STRIPE_SECRET_KEY = (ctx.get<string>("stripeSecretKey") ?? "");
          values.VITE_STRIPE_PUBLISHABLE_KEY = (ctx.get<string>("stripePublishableKey") ?? "");
          values.STRIPE_WEBHOOK_SECRET = (ctx.get<string>("stripeWebhookSecret") ?? "");
        }

        // Email
        values.RESEND_API_KEY = (ctx.get<string>("resendApiKey") ?? "");

        // Storage
        values.S3_ENDPOINT = (ctx.get<string>("s3Endpoint") ?? "");
        values.S3_ACCESS_KEY_ID = (ctx.get<string>("s3AccessKeyId") ?? "");
        values.S3_SECRET_ACCESS_KEY = (ctx.get<string>("s3SecretAccessKey") ?? "");
        values.S3_BUCKET = (ctx.get<string>("s3Bucket") ?? "");
        values.S3_PUBLIC_URL = (ctx.get<string>("s3PublicUrl") ?? "");
        values.S3_PRIVATE_BUCKET = "";
        values.VITE_STORAGE_URL = "";

        await writeEnvFile(dir, values, force);
      },
    }),

    // -- Install dependencies ----------------------------------------------
    run("bun-install", {
      message: "Installing dependencies",
      run: async (ctx) => {
        const dir = getDir(ctx);
        const { exitCode, stdout } = await ctx.run(`cd "${dir}" && bun install`);
        if (exitCode !== 0) throw new Error(stdout);
      },
    }),

    // -- Database setup ----------------------------------------------------
    run("db-generate", {
      message: "Generating database migrations",
      run: async (ctx) => {
        const dir = getDir(ctx);
        const { exitCode, stdout } = await ctx.run(`cd "${dir}" && bun run db:generate`);
        if (exitCode !== 0) throw new Error(stdout);
      },
    }),

    run("db-migrate", {
      message: "Running database migrations",
      run: async (ctx) => {
        const dir = getDir(ctx);
        const { exitCode, stdout } = await ctx.run(`cd "${dir}" && bun run db:migrate`);
        if (exitCode !== 0) throw new Error(stdout);
      },
    }),

    run("db-seed", {
      message: "Seeding database",
      run: async (ctx) => {
        const dir = getDir(ctx);
        const { exitCode, stdout } = await ctx.run(`cd "${dir}" && bun run db:seed`);
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
  ],
  steps: initSteps((ctx) => resolve(ctx.arg("directory") || ".")),
  summary: (ctx) => {
    const name = ctx.get<string>("projectName") ?? "TSKit";
    const providers = ctx.get<string[]>("authProviders") ?? [];
    const billing = ctx.get<boolean>("enableBilling") ? "Stripe" : "none";
    const features = [
      providers.length > 0 ? `OAuth: ${providers.join(", ")}` : null,
      `Billing: ${billing}`,
      "Email: Resend",
      "Storage: R2",
    ].filter(Boolean).join(" | ");

    return `${name} is ready!\n  ${features}\n  Run: bun dev`;
  },
};
