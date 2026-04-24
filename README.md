# Codex Workspace V1

This repository is implementing the V1 execution substrate for a Codex-first workspace contract.

## Phase 1 Commands

- `node --experimental-strip-types src/cli.ts init <path>`
- `node --experimental-strip-types src/cli.ts doctor [path]`

## Validation

- `node --experimental-strip-types tests/phase1.test.ts`

The current CLI is implemented in TypeScript and runs directly on Node 24's built-in type-stripping support, so Phase 1 does not require a separate compiler install.
