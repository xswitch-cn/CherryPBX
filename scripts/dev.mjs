import { spawn } from "node:child_process";

const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

/**
 * Start both workspace watchers so changes in api-client rebuild automatically
 * and Next.js can pick them up without restarting the dev server.
 */
function startProcess(name, args) {
  const child = spawn(pnpmCommand, args, {
    stdio: "inherit",
    env: process.env,
    shell: true,
  });

  child.on("exit", (code, signal) => {
    processes.delete(name);

    if (isShuttingDown) {
      maybeExit();
      return;
    }

    shutdown(signal ?? code ?? 1);
  });

  child.on("error", () => {
    shutdown(1);
  });

  processes.set(name, child);

  return child;
}

const processes = new Map();
let isShuttingDown = false;
let finalExitCode = 0;

function maybeExit() {
  if (isShuttingDown && processes.size === 0) {
    process.exit(finalExitCode);
  }
}

function shutdown(exitCode = 0) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  finalExitCode = typeof exitCode === "number" ? exitCode : 1;

  for (const child of processes.values()) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }

  setTimeout(() => {
    for (const child of processes.values()) {
      if (!child.killed) {
        child.kill("SIGKILL");
      }
    }
    process.exit(finalExitCode);
  }, 3000).unref();

  maybeExit();
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

startProcess("api-client", ["--filter", "@repo/api-client", "dev"]);
startProcess("web", ["run", "dev:web"]);
