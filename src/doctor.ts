import { existsSync, readdirSync, statSync } from "node:fs";
import { delimiter, extname, join, resolve } from "node:path";
import { BUILTIN_RUNNER_TYPE, PROJECT_MANIFEST_FILENAME } from "./constants.ts";
import { ManifestValidationError } from "./errors.ts";
import { findWorkspaceRoot, loadWorkspaceManifest } from "./manifest.ts";
import type { DoctorReport, WorkspaceManifest } from "./types.ts";

export function runDoctor(startPath: string): DoctorReport {
  const workspaceRoot = findWorkspaceRoot(startPath);
  const manifest = loadWorkspaceManifest(workspaceRoot);

  const errors: string[] = [];
  let discoveredProjects: string[] = [];

  if (manifest.doctorChecks.validate_shared_assets ?? true) {
    errors.push(...validateSharedAssets(workspaceRoot, manifest));
  }

  if (manifest.doctorChecks.validate_project_roots ?? true) {
    const projectRootValidation = validateProjectRoots(workspaceRoot, manifest);
    errors.push(...projectRootValidation.errors);
    discoveredProjects = projectRootValidation.discoveredProjects;
  }

  if (manifest.doctorChecks.validate_runner_registration ?? true) {
    errors.push(...validateRunners(manifest));
  }

  if (errors.length > 0) {
    throw new ManifestValidationError(errors);
  }

  return {
    workspaceRoot,
    workspaceName: manifest.workspaceName,
    discoveredProjects,
  };
}

function validateSharedAssets(
  workspaceRoot: string,
  manifest: WorkspaceManifest,
): string[] {
  const errors: string[] = [];

  for (const [fieldName, relativePath] of Object.entries(manifest.sharedAssets)) {
    const targetPath = resolve(workspaceRoot, relativePath);
    if (!existsSync(targetPath)) {
      errors.push(
        `shared_assets.${fieldName} points to a missing path: ${relativePath}`,
      );
      continue;
    }

    if (fieldName.endsWith("_dir") && !statSync(targetPath).isDirectory()) {
      errors.push(
        `shared_assets.${fieldName} must point to a directory: ${relativePath}`,
      );
    }

    if (!fieldName.endsWith("_dir") && !statSync(targetPath).isFile()) {
      errors.push(`shared_assets.${fieldName} must point to a file: ${relativePath}`);
    }
  }

  return errors;
}

function validateProjectRoots(
  workspaceRoot: string,
  manifest: WorkspaceManifest,
): { errors: string[]; discoveredProjects: string[] } {
  const errors: string[] = [];
  const discoveredProjects: string[] = [];

  for (const projectRoot of manifest.projectRoots) {
    const projectRootPath = resolve(workspaceRoot, projectRoot);
    if (!existsSync(projectRootPath)) {
      errors.push(`project_roots entry is missing on disk: ${projectRoot}`);
      continue;
    }

    if (!statSync(projectRootPath).isDirectory()) {
      errors.push(`project_roots entry must be a directory: ${projectRoot}`);
      continue;
    }

    walkForProjectManifests(projectRootPath, discoveredProjects);
  }

  return { errors, discoveredProjects };
}

function validateRunners(manifest: WorkspaceManifest): string[] {
  const errors: string[] = [];

  for (const [runnerName, runner] of Object.entries(manifest.runners)) {
    if (runner.runnerType === BUILTIN_RUNNER_TYPE) {
      continue;
    }

    if (runner.runnerType === "command") {
      const commandName = runner.extraConfig.command;
      if (typeof commandName !== "string" || commandName.trim() === "") {
        errors.push(
          `runners.${runnerName}.command must be a non-empty string for runner_type 'command'.`,
        );
        continue;
      }

      if (!commandExists(commandName)) {
        errors.push(
          `runners.${runnerName}.command '${commandName}' is not available on PATH.`,
        );
      }

      for (const requiredCommand of runner.requiredCommands) {
        if (!commandExists(requiredCommand)) {
          errors.push(
            `runners.${runnerName} requires missing command '${requiredCommand}'.`,
          );
        }
      }
      continue;
    }

    errors.push(
      `runners.${runnerName}.runner_type '${runner.runnerType}' is not supported.`,
    );
  }

  return errors;
}

function walkForProjectManifests(directoryPath: string, discoveredProjects: string[]): void {
  for (const entry of readdirSync(directoryPath, { withFileTypes: true })) {
    const entryPath = join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      walkForProjectManifests(entryPath, discoveredProjects);
      continue;
    }

    if (entry.isFile() && entry.name === PROJECT_MANIFEST_FILENAME) {
      discoveredProjects.push(entryPath);
    }
  }
}

function commandExists(commandName: string): boolean {
  const pathEntries = (process.env.PATH ?? "")
    .split(delimiter)
    .map((entry) => entry.trim())
    .filter(Boolean);
  const pathExtensions =
    process.platform === "win32"
      ? ["", ...(process.env.PATHEXT ?? ".COM;.EXE;.BAT;.CMD;.PS1").split(";")]
      : [""];

  const candidatePaths: string[] = [];
  if (commandName.includes("/") || commandName.includes("\\")) {
    candidatePaths.push(commandName);
  } else {
    for (const pathEntry of pathEntries) {
      candidatePaths.push(join(pathEntry, commandName));
    }
  }

  for (const candidatePath of candidatePaths) {
    const candidateExtension = extname(candidatePath);
    if (candidateExtension) {
      if (existsSync(candidatePath) && statSync(candidatePath).isFile()) {
        return true;
      }
      continue;
    }

    for (const extension of pathExtensions) {
      const resolvedPath = `${candidatePath}${extension}`;
      if (existsSync(resolvedPath) && statSync(resolvedPath).isFile()) {
        return true;
      }
    }
  }

  return false;
}
