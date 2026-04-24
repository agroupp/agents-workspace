import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { runDoctor } from "./doctor.ts";
import { CodexWorkspaceError, ManifestValidationError } from "./errors.ts";
import { initWorkspace } from "./init-workspace.ts";

export function main(argv: string[] = process.argv.slice(2)): number {
  const [command, ...rest] = argv;

  if (!command || command === "--help" || command === "-h") {
    printHelp();
    return 0;
  }

  try {
    if (command === "init") {
      const options = parseInitArguments(rest);
      const workspaceRoot = initWorkspace(options);
      console.log(
        `Initialized workspace '${options.workspaceName ?? workspaceRoot.split(/[\\/]/).at(-1)}' at ${workspaceRoot}.`,
      );
      return 0;
    }

    if (command === "doctor") {
      const doctorPath = parseDoctorArguments(rest);
      const report = runDoctor(doctorPath);
      console.log(
        `Doctor passed for '${report.workspaceName}' at ${report.workspaceRoot} (${report.discoveredProjects.length} project manifests discovered).`,
      );
      return 0;
    }

    console.error(`Error: Unsupported command '${command}'.`);
    printHelp();
    return 1;
  } catch (error) {
    if (error instanceof CodexWorkspaceError) {
      printError(error);
      return error.exitCode;
    }

    const message = error instanceof Error ? error.message : String(error);
    console.error(`Unexpected error: ${message}`);
    return 1;
  }
}

function parseInitArguments(args: string[]): {
  targetPath: string;
  workspaceName?: string;
  workspaceDescription?: string;
  force: boolean;
} {
  let targetPath = ".";
  let workspaceName: string | undefined;
  let workspaceDescription: string | undefined;
  let force = false;
  let positionalPathConsumed = false;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];

    if (argument === "--workspace-name") {
      workspaceName = takeOptionValue(args, index, argument);
      index += 1;
      continue;
    }

    if (argument === "--description") {
      workspaceDescription = takeOptionValue(args, index, argument);
      index += 1;
      continue;
    }

    if (argument === "--force") {
      force = true;
      continue;
    }

    if (!argument.startsWith("-") && !positionalPathConsumed) {
      targetPath = argument;
      positionalPathConsumed = true;
      continue;
    }

    throw new CodexWorkspaceError(`Unknown init argument '${argument}'.`);
  }

  return {
    targetPath,
    workspaceName,
    workspaceDescription,
    force,
  };
}

function parseDoctorArguments(args: string[]): string {
  if (args.length === 0) {
    return ".";
  }

  if (args.length === 1 && !args[0].startsWith("-")) {
    return args[0];
  }

  throw new CodexWorkspaceError("doctor accepts at most one optional path argument.");
}

function takeOptionValue(args: string[], index: number, optionName: string): string {
  const optionValue = args[index + 1];
  if (!optionValue || optionValue.startsWith("-")) {
    throw new CodexWorkspaceError(`${optionName} requires a value.`);
  }
  return optionValue;
}

function printHelp(): void {
  console.log("Usage:");
  console.log(
    "  node --experimental-strip-types src/cli.ts init [path] [--workspace-name NAME] [--description TEXT] [--force]",
  );
  console.log("  node --experimental-strip-types src/cli.ts doctor [path]");
}

function printError(error: CodexWorkspaceError): void {
  if (error instanceof ManifestValidationError) {
    console.error("Doctor found contract issues:");
    for (const issue of error.errors) {
      console.error(`- ${issue}`);
    }
    return;
  }

  console.error(`Error: ${error.message}`);
}

const executedPath = process.argv[1] ? resolve(process.argv[1]) : "";
const modulePath = fileURLToPath(import.meta.url);
if (executedPath === modulePath) {
  process.exitCode = main();
}
