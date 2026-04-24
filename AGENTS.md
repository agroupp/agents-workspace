## Project description

- This repository defines a Codex-first workspace contract and generator for building autonomous systems from skills, scripts, conventional code, and portable containers.
- The core value is a ready-to-use Codex development environment where the agent already understands the workspace conventions, helper assets, and execution model.
- The workspace must remain tool-agnostic: support skills-only projects, Python or TypeScript services, and hybrid systems without requiring a single monorepo or language ecosystem.
- Initial first-class project kinds are `skill-pack`, `scheduled-job`, and `service`.
- Default product posture is artifact generation and decision support. High-risk irreversible actions should remain behind deterministic code paths or explicit approval layers.

## Session Memory Hooks

- Start hook: after reading `AGENTS.md`, read `.agents/SNAPSHOT.md` before exploring the project so the agent starts from the latest durable context.
- Treat `.agents/SNAPSHOT.md` as orientation, not proof. Verify facts against the repository before making risky changes.
- End hook: before finishing any task or session, update `.agents/SNAPSHOT.md` with a brief summary of work completed, current in-progress state, known issues, and next steps.
- Snapshot maintenance is pre-authorized when these hooks require it; do not ask the user for separate permission before reading or updating `.agents/SNAPSHOT.md`.
- Keep `.agents/SNAPSHOT.md` concise and agent-readable. Prefer short bullets, current facts, and actionable next steps over transcripts or long narratives.
- Preserve the snapshot template sections exactly: `What was done`, `What is in progress`, `Known issues`, and `Next steps`.
- Update `Last updated` using the current local date in `YYYY-MM-DD` format.
- Use the `session-snapshot` skill whenever snapshot context is requested or the snapshot needs to be initialized, read, or updated.

## Detailed Rule Files

- Keep `AGENTS.md` as the concise index of durable rules. Move detailed, domain-specific guidance into `.agents/rules` and link it here.
- Read [doc/v1-decisions.md](doc/v1-decisions.md) before changing workspace structure, `.agents` conventions, project kinds, runner abstractions, CLI surface, or container packaging expectations.

## Operating Rules

- If a required tool or dependency is missing, stop and ask before installing or adding it.
- Store project documents in `doc`, including PRDs, plans, task lists, architecture notes, and decision records.
- Modify only files and patterns directly related to the user's request.
- If you notice an unrelated improvement opportunity, mention it but do not implement it.
- Preserve the tool-agnostic workspace design. Do not introduce mandatory Nx, Node.js, pnpm, or TypeScript assumptions unless the user explicitly requests that direction.
- Prefer small workspace contracts and runner abstractions over hard-wired raw Codex invocation details.
- Keep deployment work scoped to portable container packaging unless the user explicitly asks for infrastructure or hosting workflows.
- Treat `codex.workspace.toml` and `codex.project.toml` as planned interfaces. Until the PRD defines them, avoid inventing incompatible schemas without documenting the decision in `doc`.

## Investigation and Debugging

- Investigate the actual root cause before proposing or implementing fixes.
- Read logs, trace code paths, and confirm the issue before changing code.
- Never modify production code solely to work around a local development issue.
- When behavior conflicts with a constraint such as a guard, type check, validation rule, test, or lint rule, treat the violation as the bug. Ask why the constraint exists before changing it.

## Implementation Discipline

- Read before writing: before changing a pattern, component, or API, inspect at least three existing usages when available.
- List the relevant patterns found before making the change.
- Prefer a Read:Edit ratio of roughly 3:1.
- For changes spanning three or more files, verify after each coherent slice. Stop and fix failures before continuing.

## Code Quality Principles

- **Single Responsibility**: each class, component, or function should have one reason to change.
- **Open/Closed**: code should be open for extension and closed for modification.
- **Liskov Substitution**: subtypes must be substitutable for base types.
- **Interface Segregation**: prefer many specific interfaces over one general-purpose interface.
- **Dependency Inversion**: depend on abstractions, not concretions.
- Validate at API boundaries where needed. Zod is available but not required for every type.
- DRY, KISS, YAGNI, Boy Scout Rule.
- **Naming**: use descriptive, searchable names. Avoid abbreviations and use one word per concept.
- **Functions**: keep functions small and focused. Prefer pure functions and a single abstraction level.
- Prefer functions with three or fewer parameters; use an options object when more are needed.
- **Errors**: use exceptions instead of return codes. Write meaningful messages and handle errors at the appropriate level.

## Type Definition Patterns

- Use `interface` for object shapes.
- Use union types for status and state enums.
