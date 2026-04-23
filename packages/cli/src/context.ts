import { exec } from "node:child_process";
import * as clack from "@clack/prompts";

export class StepContext {
  private state = new Map<string, unknown>();
  private stepStatuses = new Map<string, "completed" | "failed">();
  private args_: Record<string, string>;
  private flags_: Record<string, string | boolean>;
  private cancelled_ = false;

  constructor(
    args: Record<string, string> = {},
    flags: Record<string, string | boolean> = {},
  ) {
    this.args_ = args;
    this.flags_ = flags;
  }

  // -- state ----------------------------------------------------------------

  get<T>(key: string): T | undefined {
    return this.state.get(key) as T | undefined;
  }

  set(key: string, value: unknown): void {
    this.state.set(key, value);
  }

  has(key: string): boolean {
    return this.state.has(key);
  }

  // -- step status ----------------------------------------------------------

  markCompleted(stepName: string): void {
    this.stepStatuses.set(stepName, "completed");
  }

  markFailed(stepName: string): void {
    this.stepStatuses.set(stepName, "failed");
  }

  completed(stepName: string): boolean {
    return this.stepStatuses.get(stepName) === "completed";
  }

  failed(stepName: string): boolean {
    return this.stepStatuses.get(stepName) === "failed";
  }

  // -- args & flags ---------------------------------------------------------

  arg(name: string): string {
    return this.args_[name] ?? "";
  }

  flag(name: string): string | boolean | undefined {
    return this.flags_[name];
  }

  // -- shell execution ------------------------------------------------------

  run(command: string, options?: { cwd?: string }): Promise<{ stdout: string; exitCode: number }> {
    return new Promise((resolve) => {
      exec(command, { cwd: options?.cwd }, (error, stdout, stderr) => {
        if (error) {
          resolve({ stdout: (stderr || error.message).trim(), exitCode: error.code ?? 1 });
        } else {
          resolve({ stdout: stdout.trim(), exitCode: 0 });
        }
      });
    });
  }

  // -- cancellation ---------------------------------------------------------

  cancel(): void {
    this.cancelled_ = true;
  }

  get isCancelled(): boolean {
    return this.cancelled_;
  }

  // -- logging --------------------------------------------------------------

  log(message: string): void {
    clack.log.info(message);
  }
}
