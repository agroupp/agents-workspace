# Project Snapshot

**Status**: active
**Last updated**: 2026-04-24

## What was done

- Implemented Phase 1 of `doc/plans/v1-implementation.md` in TypeScript using Node 24's built-in type-stripping support.
- Added a Phase 1 CLI at `src/cli.ts` with `init` and `doctor` command flows plus supporting manifest, bootstrap, and preflight modules in `src/`.
- Added a versioned `codex.workspace.toml` contract model with workspace defaults, runner registration, shared asset declarations, and project root discovery.
- Added `tests/phase1.test.ts` to validate the clean bootstrap path, missing required manifest fields, and invalid default runner references.
- Updated `README.md` and the Phase 1 plan checkboxes to reflect the new command surface and completed validation work.

## What is in progress

- Phase 1 is complete and validated.
- Phase 2 has not started yet; the next slice is `skill-pack` project generation plus `run`, `verify`, and not-applicable `pack` behavior.

## Known issues

- Phase 2 and later still carry open contract questions around schedule syntax, artifact/run-record location, and how much runner configurability V1 should expose initially.
- The current environment's `npm` command is misconfigured (`npm --version` fails), so validation currently relies on direct `node --experimental-strip-types ...` commands instead of package-manager wrappers.
- Node's built-in `node:test` runner hit sandbox `EPERM` spawning behavior here, so Phase 1 tests are implemented as an in-process TypeScript test script.

## Next steps

- Start Phase 2 from `doc/plans/v1-implementation.md`: `new --kind skill-pack <name>`, `run <project>`, `verify <project>`, and the first safe-by-default project template.
- Decide the durable artifact and run-record location before locking the Phase 2 output contract more deeply.
- Revisit later whether to add a compiled TypeScript path or continue using Node 24's built-in type stripping as the internal implementation approach.
