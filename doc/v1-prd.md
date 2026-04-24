# V1 Execution Substrate PRD

## Problem Statement

Engineering teams building autonomous systems currently have to recreate the same Codex context, execution conventions, and safety posture for every new project. From the user's perspective, this means each new skill pack, scheduled job, or service begins with avoidable setup work: teaching Codex the workspace rules, inventing ad hoc runner scripts, deciding how outputs should be shaped, and re-solving packaging and verification. The result is slower delivery, inconsistent project structure, brittle local conventions, and no default guarantee that another developer or CI can run, verify, or package the project the same way.

The user needs a workspace contract that makes Codex productive immediately without forcing a single language ecosystem, build system, or deployment platform. The user also needs a safe default posture that favors artifact generation and decision support, while keeping dangerous external actions behind deterministic code paths or explicit approval layers.

## Solution

The product will provide a CLI-first, Codex-first workspace generator and execution substrate for autonomous systems. From the user's perspective, a new workspace should start with shared Codex rules, reusable skills and scripts, a small root manifest, and a consistent project model that supports `skill-pack`, `scheduled-job`, and `service` projects in the same repository.

Each project will declare its behavior through a small project manifest and will run through a stable runner contract rather than raw Codex invocation details. The default runner implementation will be `CodexRunner`, but the workspace contract will allow additional runners later without changing project definitions.

V1 will optimize for artifact generation and decision support. Projects may produce reports, patches, ranked options, configs, and deployable services, but irreversible actions must remain behind deterministic adapters or explicit approval flows. Deployable projects will share a standard OCI-compatible packaging contract, while infrastructure provisioning and managed hosting remain out of scope.

## User Stories

1. As a workspace maintainer, I want to initialize a new Codex-ready workspace with one command, so that every project starts with the same baseline operating rules and shared assets.
2. As a workspace maintainer, I want the workspace contract to support skills-only projects, Python services, TypeScript services, and hybrid systems, so that I can choose the right tools per project instead of adopting a mandatory monorepo stack.
3. As a project author, I want to create a new project by kind from the CLI, so that I can start from a minimal working template instead of scaffolding everything by hand.
4. As a project author, I want each generated project to include a small manifest with clear required fields, so that I know exactly what must be configured for the project to run.
5. As a workspace maintainer, I want shared Codex rules, skills, and deterministic helpers to be available across projects, so that common behavior is reused consistently.
6. As a developer, I want to run any project through one standard command, so that local execution is predictable even when projects use different languages or toolchains.
7. As a developer, I want to verify any project through one standard command, so that I can confirm the project still behaves as intended before sharing or deploying it.
8. As a deployment-oriented developer, I want deployable projects to package through one standard command, so that services and jobs can be moved into portable containers without bespoke build logic.
9. As a scheduled-job author, I want to declare schedule, timezone, trigger mode, timeout, and concurrency policy in the project contract, so that automated runs are reproducible and understandable.
10. As a scheduled-job author, I want to simulate or manually trigger a job with the same runtime contract used by scheduled execution, so that I can debug behavior before enabling automation.
11. As a project author, I want to declare the primary artifacts and supporting outputs my project produces, so that downstream users know what to expect from a successful run.
12. As an operator, I want every run to emit a structured run record and readable logs, so that failures can be diagnosed without reverse-engineering the runtime.
13. As a service developer, I want services to declare a standard entrypoint, environment contract, and health checks, so that local runs, verification, and packaging all target the same operational behavior.
14. As a security reviewer, I want projects to declare their external-effect posture explicitly, so that advisory systems remain safe by default and risky actions are easy to identify.
15. As a developer, I want missing dependencies, invalid manifests, and missing environment values to fail with clear diagnostics, so that configuration errors are fixed quickly.
16. As a CI operator, I want the same workspace commands to work non-interactively, so that local expectations and CI expectations do not diverge.
17. As a workspace maintainer, I want a doctor command that validates the workspace contract and runtime prerequisites, so that setup issues are caught before deeper commands fail.
18. As a runner implementer, I want projects to depend on a stable runner contract instead of raw Codex invocation details, so that new runners can be added later without rewriting project definitions.
19. As a developer using `CodexRunner`, I want local and containerized execution to produce the same artifacts, logs, and status model, so that packaging does not change project semantics.
20. As a workspace maintainer, I want workspace-wide defaults with project-level overrides, so that common policy is centralized without blocking specialized projects.
21. As a maintainer of long-lived workspaces, I want manifests to carry explicit schema versions, so that the contract can evolve without silent breakage.
22. As a project owner, I want it to be obvious which project kinds are deployable and which are advisory-only, so that packaging expectations stay aligned with the project model.
23. As a platform engineer, I want starter templates for each first-class project kind, so that the generator proves the contract with real examples instead of only documentation.
24. As an engineering lead, I want the default workspace posture to favor artifact generation, recommendations, and decision support, so that high-risk autonomous actions are not normalized by default.

## Implementation Decisions

- The root workspace manifest will define these required fields: `schema_version`, `workspace_name`, `workspace_description`, `project_roots`, `default_runner`, `runners`, `shared_assets`, `verification_defaults`, `artifact_defaults`, `packaging_defaults`, and `doctor_checks`.
- `project_roots` will define where project manifests are discovered. `shared_assets` will define the shared Codex rules, memory, reusable skills, and deterministic helper resources that belong to the workspace contract. `runners` will register available runner implementations by name plus runner-specific configuration.
- Every project manifest will define these required common fields: `schema_version`, `project_name`, `kind`, `description`, `owner`, `runner`, `entrypoint`, `environment`, `artifacts`, `verification`, `dependencies`, and `capabilities`.
- `environment` will declare required configuration keys, optional defaults, and whether each value is secret. Secret values will never be stored in manifests; manifests will only declare the names and requirements of those values.
- `artifacts` will declare the primary artifact type, supporting outputs, retention expectations, and whether a human-readable summary is required. Every successful run must produce a structured run record, readable logs, and declared artifacts.
- `capabilities` will declare the project's effect posture. V1 will support `advisory` as the default mode and `gated_execution` for projects that rely on deterministic adapters or approval-controlled side effects.
- `skill-pack` projects will additionally define `exported_skills`, `shared_context`, and `verification_fixtures` so that reusable skill bundles remain testable and discoverable.
- `scheduled-job` projects will additionally define `schedule`, `trigger_mode`, `concurrency_policy`, `timeout`, `retries`, and `retention`. `schedule` must support timezone-aware cron expressions or fixed intervals. `trigger_mode` must distinguish manual-only, scheduled, and hybrid execution.
- `service` projects will additionally define `service_interface`, `listen_config`, `health_checks`, and `operational_dependencies` so that runtime behavior can be validated consistently across local runs and packaged deployments.
- The runner contract will require every runner implementation to support project resolution, dependency diagnosis, local execution, verification execution, artifact publication, and container handoff through the same status and output model.
- Runner execution must accept the resolved workspace context, resolved project context, execution mode, environment values, writable artifact location, and any declared inputs. Runner results must include status, timestamps, logs, and artifact references.
- `CodexRunner` will be the first runner implementation. Locally, it will be invoked through the CLI with the resolved manifests, selected mode, environment contract, and writable output target. In containers, it will run through a thin runtime shim that preserves the same inputs, outputs, and status behavior as local execution.
- The CLI surface for V1 will include `init`, `new --kind <kind> <name>`, `run <project>`, `verify <project>`, `pack <project>`, and `doctor`.
- `init` will create the baseline workspace contract, shared Codex assets, default runner registration, and starter metadata for project discovery.
- `new --kind <kind> <name>` will create a project manifest and a minimal working template for the chosen kind. The command must fail clearly if the requested name collides with an existing project or if the kind is unsupported.
- `run <project>` will validate manifests, resolve environment requirements, prepare inputs, invoke the selected runner, and write the standardized run outputs.
- `verify <project>` will execute the project's smoke path and any declared lightweight assertions or evaluation fixtures. Verification must fail with a non-zero status when required checks do not pass.
- `pack <project>` will be available for deployable `scheduled-job` and `service` projects. Packaging must produce an OCI-compatible container image definition with a standard runtime entrypoint and declared environment contract. `skill-pack` projects are not deployable by default and must report packaging as not applicable.
- `doctor` will validate manifest schemas, project discovery, runner availability, required local tools, and any missing declared configuration keys that can be checked without executing the project.
- Every generated project kind must ship with verification scaffolding. `skill-pack` projects must include fixture-driven artifact assertions, `scheduled-job` projects must include a smoke execution path plus trigger simulation, and `service` projects must include startup and health verification.
- Every generated project kind must ship with one minimal starter template that proves the contract end to end. Templates should be intentionally small, demonstrate the expected artifact or runtime behavior, and be safe by default.
- The workspace contract must remain tool-agnostic. Projects may reference Python, JavaScript, shell, or other runtimes through their own dependencies and entrypoints, but the root contract must not assume a mandatory package manager, build system, or monorepo tool.

## Testing Decisions

- Good tests will verify external behavior, contracts, outputs, and user-visible outcomes rather than private helper structure or incidental call order.
- The root manifest schema and project manifest schema must be tested through validation cases that cover required fields, incompatible combinations, version handling, and clear error messages.
- Project discovery and CLI command dispatch must be tested to confirm that `init`, `new`, `run`, `verify`, `pack`, and `doctor` honor the documented lifecycle and fail clearly on invalid input.
- The runner contract must be tested with contract-style tests that exercise resolution, execution, verification, status reporting, and artifact publication for both successful and failing runs.
- `CodexRunner` must be tested to confirm that local execution and containerized execution preserve the same inputs, outputs, status model, and artifact behavior.
- `skill-pack` template tests must verify that fixture inputs produce the expected advisory artifacts and summaries.
- `scheduled-job` template tests must verify schedule parsing, manual trigger behavior, concurrency policy enforcement, timeout handling, and artifact emission.
- `service` template tests must verify startup behavior, environment validation, declared health checks, and packability into an OCI-compatible runtime image.
- Safety posture tests must verify that advisory projects cannot silently perform irreversible actions and that `gated_execution` projects require explicit deterministic adapters or approval-controlled pathways.
- There is no meaningful test prior art in the current repository yet, so V1 must establish the canonical smoke, contract, and template-level verification patterns that later projects can reuse.

## Out of Scope

- Managed deployment, infrastructure provisioning, secrets hosting, and runtime orchestration.
- A mandatory monorepo tool, package manager, or single language ecosystem.
- A general-purpose multi-agent framework beyond the workspace and runner contract needed for Codex-first projects.
- High-risk fully autonomous direct-action systems, including default support for autonomous trading or infrastructure mutation.
- A large catalog of domain-specific templates beyond one minimal starter template for each first-class project kind.
- Storing live secret values inside workspace or project manifests.

## Further Notes

- This PRD assumes that scheduled jobs are declared through timezone-aware cron or interval semantics and that actual scheduling infrastructure is an integration concern outside the core contract.
- This PRD assumes that project manifests declare secret requirements by name while secret resolution happens through the runtime environment or deployment platform.
- Future conversational or UI-based project creation flows should call the same underlying generator contract as the CLI rather than introducing a second source of truth.
