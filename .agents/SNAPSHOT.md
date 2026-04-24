# Project Snapshot

**Status**: active
**Last updated**: 2026-04-24

## What was done

- Added the initial decision memo at `doc/v1-execution-substrate-decisions.md`.
- Captured the V1 thesis as a Codex-first workspace contract and generator for autonomous systems.
- Recorded key decisions around project kinds, runner abstraction, safety boundary, packaging scope, and CLI-first scaffolding.
- Updated `AGENTS.md` so the durable workspace rules now match the execution-substrate decisions.

## What is in progress

- PRD drafting is next and should build directly on the execution-substrate decisions document.

## Known issues

- The exact manifest schemas for `codex.workspace.toml` and `codex.project.toml` are still undefined.
- The `CodexRunner` invocation model and scheduling contract are still open design questions.

## Next steps

- Turn the decision memo into a PRD with explicit requirements, interfaces, and acceptance criteria.
- Define the root and per-project manifest schemas.
- Specify CLI command behavior, runner lifecycle, and verification scaffolding for each project kind.
