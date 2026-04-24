import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { WORKSPACE_MANIFEST_FILENAME } from "./constants.ts";
import { InitError } from "./errors.ts";
import { buildDefaultManifest, renderWorkspaceManifest } from "./manifest.ts";
import type { InitOptions } from "./types.ts";

const SNAPSHOT_TEMPLATE = `# Project Snapshot

**Status**: initialization
**Last updated**: YYYY-MM-DD

## What was done

_(must be updated after every session with a short summary)_

## What is in progress

## Known issues

## Next steps
`;

const AGENTS_TEMPLATE = `## Project description

- Describe the workspace mission, users, and safety posture here.
- Keep the workspace tool-agnostic so projects can choose the right runtime per use case.
- Default to artifact generation and decision support unless a project explicitly documents a gated execution path.

## Session Memory Hooks

- Read \`.agents/SNAPSHOT.md\` before broad project exploration.
- Treat \`.agents/SNAPSHOT.md\` as orientation, not proof; verify important facts in the repo before making risky changes.
- Update \`.agents/SNAPSHOT.md\` before finishing work so the next session starts with current context.

## Operating Rules

- Keep shared Codex assets in \`AGENTS.md\`, \`.agents/\`, \`skills/\`, \`scripts/\`, and \`tests/\`.
- Store durable project documents in \`doc/\`.
- Prefer small workspace contracts and runner abstractions over hard-wired tool assumptions.
- Stop before installing missing tools or making irreversible changes without explicit approval.
`;

export function initWorkspace(options: InitOptions): string {
  const workspaceRoot = resolve(options.targetPath);
  mkdirSync(workspaceRoot, { recursive: true });

  const manifestPath = resolve(workspaceRoot, WORKSPACE_MANIFEST_FILENAME);
  if (existsSync(manifestPath) && !options.force) {
    throw new InitError(
      `${WORKSPACE_MANIFEST_FILENAME} already exists at ${workspaceRoot}. Use --force to overwrite the managed files.`,
    );
  }

  const defaultWorkspaceName = basename(workspaceRoot) || "workspace";
  const workspaceName = options.workspaceName ?? defaultWorkspaceName;
  const workspaceDescription =
    options.workspaceDescription ?? `Codex-first workspace for ${workspaceName}.`;
  const manifest = buildDefaultManifest({ workspaceName, workspaceDescription });

  const managedFiles = new Map<string, string>([
    [resolve(workspaceRoot, "AGENTS.md"), AGENTS_TEMPLATE],
    [resolve(workspaceRoot, ".agents", "SNAPSHOT.md"), SNAPSHOT_TEMPLATE],
    [manifestPath, renderWorkspaceManifest(manifest)],
  ]);

  const managedDirectories = [
    resolve(workspaceRoot, ".agents", "rules"),
    resolve(workspaceRoot, ".agents", "skills"),
    resolve(workspaceRoot, "skills"),
    resolve(workspaceRoot, "scripts"),
    resolve(workspaceRoot, "tests"),
    resolve(workspaceRoot, "projects"),
  ];

  const placeholderFiles = [
    resolve(workspaceRoot, ".agents", "rules", ".gitkeep"),
    resolve(workspaceRoot, ".agents", "skills", ".gitkeep"),
    resolve(workspaceRoot, "skills", ".gitkeep"),
    resolve(workspaceRoot, "scripts", ".gitkeep"),
    resolve(workspaceRoot, "tests", ".gitkeep"),
    resolve(workspaceRoot, "projects", ".gitkeep"),
  ];

  if (!options.force) {
    for (const filePath of [...managedFiles.keys(), ...placeholderFiles]) {
      if (existsSync(filePath)) {
        throw new InitError(`Refusing to overwrite existing managed path: ${filePath}`);
      }
    }
  }

  for (const directoryPath of managedDirectories) {
    mkdirSync(directoryPath, { recursive: true });
  }

  for (const [filePath, contents] of managedFiles) {
    writeFileSync(filePath, contents, "utf8");
  }

  for (const filePath of placeholderFiles) {
    writeFileSync(filePath, "", "utf8");
  }

  return workspaceRoot;
}
