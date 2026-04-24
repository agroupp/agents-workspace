# V1 Execution Substrate Decisions

**Status**: Proposed  
**Date**: 2026-04-24  
**Purpose**: Capture the foundational execution-substrate decisions for V1 before writing the PRD.

## Summary

V1 should be a Codex-first workspace contract and generator for building autonomous systems from skills, scripts, conventional code, and portable containers.

V1 should not try to be a general agent framework, a mandatory monorepo system, or a managed deployment platform. The core value is a ready-to-use Codex development environment that lets developers jump into business logic instead of repeatedly teaching Codex how the project works.

## Context

The target user is an engineering team building multiple autonomous systems and wanting one studio-like workspace that can host all of them.

Those systems may be:

- skills-only scheduled jobs
- Python or TypeScript services
- hybrid systems that combine Codex, reusable scripts, and deterministic code
- Dockerized workers deployed to a VPS or other container host

Existing tools already cover adjacent problems such as workspace scaffolding, monorepo mechanics, and agent frameworks. V1 should therefore focus on the Codex-specific operating environment and execution contract.

## Decisions

### 1. Product thesis

V1 will be a Codex-first workspace for autonomous systems.

This means the product is centered on preparing an environment where Codex already understands the workspace conventions, default skills, helper scripts, and execution model. It is not positioned as a generic framework for every agent runtime.

### 2. Core substrate

The substrate will be a minimal workspace contract, not a required monorepo or build system.

Users may prefer Python with `uv`, JavaScript tooling, shell scripts, Docker-only workflows, or even skills-only projects. The workspace must support those choices rather than forcing one ecosystem.

### 3. Root workspace contract

The workspace should have a small root manifest plus Codex-native environment files.

The expected V1 shape is:

- a root workspace manifest such as `codex.workspace.toml`
- `AGENTS.md` with the baseline operating rules for Codex
- `.agents/` for workspace-local Codex dependencies, rules, memory, and shared skills
- `skills/` for reusable project-facing skills
- `scripts/` for reusable deterministic helpers
- optional conventional code directories for Python, TypeScript, or other runtimes

The key point is that the generator must bootstrap Codex behavior, not just create folders.

### 4. First-class project model

The workspace will manage one project abstraction with multiple kinds.

Initial kinds:

- `skill-pack`
- `scheduled-job`
- `service`

Each project should have its own small manifest, likely `codex.project.toml`.

This allows the same workspace to host both lightweight skills-only jobs and larger deployable systems without inventing separate discovery models for each.

### 5. Codex runtime role

Codex is the orchestration and development plane, and it may also participate in headless workers through a runner abstraction.

V1 should define a generic runner contract and ship a `CodexRunner` as the first implementation. Generated projects should depend on the runner interface rather than raw Codex invocation details.

This keeps the workspace consistent while avoiding permanent coupling to one invocation mechanism.

### 6. Safety boundary

V1 should optimize for artifact generation and decision support, not direct irreversible actions.

Examples in scope:

- market analysis reports
- research summaries
- generated patches or configs
- recommendations and ranked options
- scheduled content or intelligence pipelines

Examples explicitly deferred from the default V1 posture:

- autonomous trade execution
- direct infrastructure mutation
- other irreversible side effects controlled entirely by Codex

Dangerous actions should remain behind deterministic code paths or explicit approval layers.

### 7. Deployment boundary

V1 should standardize portable container packaging, not managed deployment.

Each deployable project should have:

- a standard runtime entrypoint
- an env/config contract
- a Docker packaging contract
- a build or pack command

VPS provisioning, orchestration, secrets management, and hosted runtime operations are out of scope for V1.

### 8. Entry point and generator model

The product should be CLI-first.

A normal command-line generator is the source of truth, because it is reproducible, scriptable, and CI-friendly. A Codex conversational wrapper can be added later, but it should call the same underlying generator.

Initial command surface:

- `codex-workspace init`
- `codex-workspace new --kind <kind> <name>`
- `codex-workspace run <project>`
- `codex-workspace verify <project>`
- `codex-workspace pack <project>`
- `codex-workspace doctor`

### 9. Verification defaults

Every generated project kind should come with basic verification scaffolding.

At minimum, V1 should provide:

- a smoke-run path
- a lightweight evaluation or assertion harness
- a standard way to confirm a project still behaves as intended

This prevents the workspace from becoming just a prompt-and-script dump with no default validation discipline.

## Non-goals

V1 is not intended to:

- replace Python, Node.js, Docker, `uv`, or package managers
- require Nx or any other monorepo tool
- become a general multi-agent framework
- ship a full deployment and hosting platform
- support high-risk fully autonomous direct-action systems by default
- deliver a large catalog of domain-specific templates in the first release

## Implications For The PRD

The PRD should define:

- the exact root manifest schema
- the per-project manifest schema
- the runner contract and `CodexRunner` behavior
- the generated workspace bootstrap files
- CLI command behavior and lifecycle
- verification requirements per project kind
- packaging requirements for deployable projects
- one minimal starter template for each initial project kind

## Open Questions For PRD Work

The PRD still needs to resolve:

- exact manifest field names and required metadata
- how scheduled jobs declare timing and triggers
- how `CodexRunner` is invoked locally and inside containers
- what output and artifact conventions generated projects must follow
- whether secrets and config conventions belong to the core contract or only to templates
