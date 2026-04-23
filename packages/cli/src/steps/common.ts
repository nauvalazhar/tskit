import { check, pass, fail } from "../types.js";
import type { CheckStep } from "../types.js";

export function nodeVersionCheck(minVersion = 18): CheckStep {
  return check("node-version", {
    run: async (ctx) => {
      const { stdout, exitCode } = await ctx.run("node --version");
      if (exitCode !== 0) return fail("Node.js is not installed");
      const match = stdout.match(/v(\d+)/);
      const major = match ? parseInt(match[1], 10) : 0;
      if (major < minVersion) return fail(`Node >= ${minVersion} required (found ${stdout})`);
      return pass(`Node ${stdout}`);
    },
  });
}

export function bunInstalledCheck(): CheckStep {
  return check("bun-installed", {
    run: async (ctx) => {
      const { stdout, exitCode } = await ctx.run("bun --version");
      if (exitCode !== 0) return fail("Bun is not installed — https://bun.sh");
      return pass(`Bun v${stdout}`);
    },
  });
}
