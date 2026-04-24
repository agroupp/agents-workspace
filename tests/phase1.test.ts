import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { main } from "../src/cli.ts";
import { WORKSPACE_MANIFEST_FILENAME } from "../src/constants.ts";

interface ConsoleCaptureResult {
  returnCode: number;
  stderr: string[];
  stdout: string[];
}

const tests: Array<{ name: string; run: () => void }> = [
  {
    name: "init followed by doctor passes in a fresh workspace",
    run() {
      withTemporaryWorkspace((workspaceRoot) => {
        const initResult = captureConsole(() => main(["init", workspaceRoot]));
        assert.equal(initResult.returnCode, 0);
        assert.match(initResult.stdout.join("\n"), /Initialized workspace/);
        assert.equal(existsSync(join(workspaceRoot, WORKSPACE_MANIFEST_FILENAME)), true);
        assert.equal(existsSync(join(workspaceRoot, "AGENTS.md")), true);
        assert.equal(existsSync(join(workspaceRoot, ".agents", "SNAPSHOT.md")), true);
        assert.equal(existsSync(join(workspaceRoot, "projects")), true);

        const doctorResult = captureConsole(() => main(["doctor", workspaceRoot]));
        assert.equal(doctorResult.returnCode, 0);
        assert.match(doctorResult.stdout.join("\n"), /Doctor passed/);
      });
    },
  },
  {
    name: "doctor reports a missing required manifest field",
    run() {
      withTemporaryWorkspace((workspaceRoot) => {
        captureConsole(() => main(["init", workspaceRoot]));
        const manifestPath = join(workspaceRoot, WORKSPACE_MANIFEST_FILENAME);
        const manifestText = readFileSync(manifestPath, "utf8").replace(
          'workspace_name = "phase1-workspace"\n',
          "",
        );
        writeFileSync(manifestPath, manifestText, "utf8");

        const doctorResult = captureConsole(() => main(["doctor", workspaceRoot]));
        assert.equal(doctorResult.returnCode, 2);
        assert.match(doctorResult.stderr.join("\n"), /workspace_name/);
      }, "phase1-workspace");
    },
  },
  {
    name: "doctor reports an invalid default runner reference",
    run() {
      withTemporaryWorkspace((workspaceRoot) => {
        captureConsole(() => main(["init", workspaceRoot]));
        const manifestPath = join(workspaceRoot, WORKSPACE_MANIFEST_FILENAME);
        const manifestText = readFileSync(manifestPath, "utf8").replace(
          'default_runner = "codex"',
          'default_runner = "missing-runner"',
        );
        writeFileSync(manifestPath, manifestText, "utf8");

        const doctorResult = captureConsole(() => main(["doctor", workspaceRoot]));
        assert.equal(doctorResult.returnCode, 2);
        assert.match(doctorResult.stderr.join("\n"), /default_runner/);
      });
    },
  },
];

let failures = 0;
for (const testCase of tests) {
  try {
    testCase.run();
    console.log(`PASS ${testCase.name}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${testCase.name}`);
    if (error instanceof Error) {
      console.error(error.stack ?? error.message);
    } else {
      console.error(String(error));
    }
  }
}

if (failures > 0) {
  throw new Error(`${failures} Phase 1 test(s) failed.`);
}

function captureConsole(run: () => number): ConsoleCaptureResult {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const originalLog = console.log;
  const originalError = console.error;

  console.log = (...args: unknown[]) => {
    stdout.push(args.map(String).join(" "));
  };
  console.error = (...args: unknown[]) => {
    stderr.push(args.map(String).join(" "));
  };

  try {
    const returnCode = run();
    return { returnCode, stderr, stdout };
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }
}

function withTemporaryWorkspace(
  run: (workspaceRoot: string) => void,
  workspaceName = "phase1-workspace",
): void {
  const tempRoot = mkdtempSync(join(tmpdir(), "codex-workspace-phase1-"));
  const workspaceRoot = resolve(tempRoot, workspaceName);

  try {
    run(workspaceRoot);
  } finally {
    rmSync(tempRoot, { force: true, recursive: true });
  }
}
