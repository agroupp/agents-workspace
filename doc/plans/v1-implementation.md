# Plan: V1 Execution Substrate

> Source PRD: [doc/v1-prd.md](../v1-prd.md)

## Architectural Decisions

Durable decisions that apply across all phases:

- **Routes / surfaces**: The CLI is the source of truth for V1. The core command surface remains `init`, `new --kind <kind> <name>`, `run <project>`, `verify <project>`, `pack <project>`, and `doctor`.
- **Schema / data shape**: The contract is anchored on versioned root and project manifests plus a standardized run record that captures status, timestamps, logs, and artifact references.
- **Key models**: Workspace manifest, project manifest, runner registration, runner execution request, runner result, artifact descriptor, verification result, and packaging descriptor.
- **Auth / authorization**: There is no general auth layer in scope for V1. Safety is enforced through project capability posture, with `advisory` as the default and `gated_execution` reserved for deterministic or approval-backed side effects.
- **Service boundaries**: Workspace discovery, manifest validation, CLI orchestration, runner execution, verification, and packaging are separate concerns. `CodexRunner` is the first runner implementation, but projects depend on the runner contract rather than runner-specific invocation details.
- **Validation strategy**: Validate manifests at load time, use `doctor` for preflight checks, ship smoke and lightweight evaluation scaffolding per project kind, and add contract tests around runner behavior and packaging parity.
- **Project kinds**: `skill-pack`, `scheduled-job`, and `service` are first-class project kinds in V1 and share the same root discovery and execution contract.
- **Deployability boundary**: `scheduled-job` and `service` are packable; `skill-pack` is advisory-only by default and reports packaging as not applicable.

## Assumptions And Open Questions

- **Assumption**: The first implementation can use any practical internal language or tooling, as long as that choice does not become a mandatory requirement for generated workspaces or project kinds.
- **Assumption**: Scheduling infrastructure is outside the core contract; V1 only needs manifest-level schedule semantics plus local trigger simulation.
- **Assumption**: Secret values are declared by name in manifests and resolved from the runtime environment or deployment system rather than stored in workspace files.
- **Open question**: What exact schedule syntax should V1 standardize on for `scheduled-job` projects: cron only, interval only, or both with a constrained grammar?
- **Open question**: What exact artifact directory and run-record location should be standardized across local runs, verification runs, and packaged execution?
- **Open question**: How much runner configurability should be exposed in the root manifest before there is a second runner implementation to validate the abstraction?

## Out-Of-Scope Constraints

- Managed deployment, infrastructure provisioning, and hosted runtime operations remain out of scope.
- V1 must not require a monorepo tool, single package manager, or single runtime ecosystem.
- High-risk autonomous direct-action systems remain out of scope for the default V1 posture.
- V1 should ship one minimal starter template per first-class project kind rather than a broad template catalog.

---

## Phase 1: Workspace Bootstrap And Contract Preflight

**User stories**: 1. initialize a Codex-ready workspace; 2. support multiple runtime ecosystems without a mandatory stack; 5. share Codex rules, skills, and helpers across projects; 15. fail clearly on invalid setup; 17. validate prerequisites with `doctor`; 20. support workspace defaults with project overrides; 21. version manifests.

### What to build

Build the first end-to-end workspace loop around `init` and `doctor`. A maintainer should be able to create a workspace, receive the baseline Codex assets and versioned root manifest, and immediately run a preflight command that validates discovery rules, runner registration, shared assets, and obvious configuration mistakes. This slice should prove the root contract works before any project kind is introduced.

### Acceptance criteria

- [x] `init` creates a versioned root workspace manifest plus the baseline Codex-native workspace assets required by the contract.
- [x] The root manifest supports workspace-wide defaults, runner registration, and project discovery without assuming a specific application runtime.
- [x] `doctor` validates manifest structure, project root discovery, runner availability, and missing prerequisite configuration with clear non-zero failures.
- [x] A freshly initialized workspace can pass `doctor` without adding any project yet.

### Validation

- [x] Create a fresh workspace with `init`, then run `doctor` and confirm a clean pass.
- [x] Break one required manifest field and confirm `doctor` reports a targeted validation error.
- [x] Add a missing or invalid runner reference and confirm preflight fails before runtime execution begins.

---

## Phase 2: First Runnable `skill-pack` Loop

**User stories**: 3. create a project by kind from the CLI; 4. generate a project manifest with clear required fields; 6. run a project through one standard command; 7. verify it through one standard command; 11. declare expected artifacts; 12. emit structured run records and readable logs; 14. declare external-effect posture explicitly; 18. depend on a stable runner contract; 23. ship a minimal starter template; 24. keep the default posture focused on artifact generation and decision support.

### What to build

Build the first full project slice using `skill-pack`, because it exercises the safest and simplest version of the contract. A maintainer should be able to generate a `skill-pack` project, inspect its manifest, run it through `CodexRunner`, receive declared advisory artifacts plus a standard run record, and verify the project with fixture-driven assertions. This slice should also establish the capability posture model and the first runnable starter template.

### Acceptance criteria

- [ ] `new --kind skill-pack <name>` generates a working project manifest and a minimal safe-by-default template.
- [ ] `run <project>` resolves the workspace and project manifests, invokes `CodexRunner`, and writes logs, run metadata, and declared advisory artifacts.
- [ ] `verify <project>` executes a smoke path and lightweight fixture-driven assertions against the generated outputs.
- [ ] The project manifest exposes capability posture, environment requirements, artifact declarations, and runner selection through stable contract fields.
- [ ] `pack <project>` reports `skill-pack` as not applicable rather than attempting a deployable packaging flow.

### Validation

- [ ] Generate a new `skill-pack`, run it, and confirm artifacts plus run metadata are produced in the standard format.
- [ ] Run `verify` on the generated `skill-pack` and confirm it fails when fixture expectations are intentionally broken.
- [ ] Attempt to mark the `skill-pack` as deployable without the required contract changes and confirm the command fails clearly.

---

## Phase 3: Scheduled-Job Trigger And Verification Loop

**User stories**: 3. create projects by kind; 4. generate clear manifests; 6. run through a standard command; 7. verify through a standard command; 9. declare schedule, timezone, trigger mode, timeout, and concurrency policy; 10. simulate or manually trigger scheduled execution; 11. declare outputs; 12. emit run records and logs; 14. preserve explicit safety posture; 15. fail clearly on invalid configuration; 22. make deployable versus advisory expectations obvious; 23. ship a starter template; 24. keep the default posture advisory-first.

### What to build

Build the first automated-project slice using `scheduled-job`. A maintainer should be able to generate a job, declare its schedule and execution policy in the project manifest, manually trigger it through the same `run` surface used for local development, and verify both its smoke path and trigger semantics. This slice should prove that timing metadata, retry and timeout rules, and job-specific validation can live inside the shared project contract without introducing external scheduler dependencies.

### Acceptance criteria

- [ ] `new --kind scheduled-job <name>` generates a job template with schedule, trigger mode, retry, timeout, concurrency, and retention fields.
- [ ] `run <project>` supports manual execution of a `scheduled-job` using the same runner contract as future scheduled execution.
- [ ] `verify <project>` checks the smoke path plus schedule and trigger-related validation relevant to local simulation.
- [ ] Invalid schedule syntax, unsupported trigger combinations, or conflicting concurrency settings fail with targeted diagnostics.
- [ ] The generated job template remains advisory-by-default unless explicit gated behavior is declared through the project capabilities contract.

### Validation

- [ ] Generate a `scheduled-job`, run it manually, and confirm it produces the declared artifacts and standard run record.
- [ ] Run verification against valid and intentionally invalid schedule definitions to confirm clear pass/fail behavior.
- [ ] Exercise manual-only, scheduled, and hybrid trigger modes in local simulation and confirm each resolves to the documented behavior.

---

## Phase 4: Service Runtime And Health Loop

**User stories**: 3. create projects by kind; 4. generate clear manifests; 6. run through a standard command; 7. verify through a standard command; 11. declare outputs; 12. emit run records and logs; 13. declare service entrypoint, environment contract, and health checks; 15. fail clearly on missing environment values; 22. make deployability obvious; 23. ship a starter template.

### What to build

Build the first long-running runtime slice using `service`. A maintainer should be able to generate a service project, start it through the shared command surface, validate its environment contract, and verify it through startup and health checks. This slice should prove that the project model can represent interactive or long-lived workloads without breaking the same runner, manifest, and verification abstractions already used for advisory jobs.

### Acceptance criteria

- [ ] `new --kind service <name>` generates a service template with service interface, listen configuration, health checks, and operational dependency declarations.
- [ ] `run <project>` can start the generated service locally through the shared runner contract and surface startup logs plus run metadata.
- [ ] `verify <project>` exercises startup and health behavior and fails clearly when required environment variables or health checks are missing.
- [ ] The service template makes its deployable status explicit through the project contract and shares the same standardized artifact and logging model where applicable.

### Validation

- [ ] Generate a service, start it locally, and confirm the documented health path becomes reachable.
- [ ] Remove or corrupt a required environment value and confirm the run or verify path fails with targeted diagnostics.
- [ ] Break the health contract intentionally and confirm verification catches the failure without requiring packaging first.

---

## Phase 5: Deployable Packaging Parity And Non-Interactive Execution

**User stories**: 8. package deployable projects through one standard command; 16. support non-interactive CI execution; 18. keep the runner contract stable for future implementations; 19. preserve output parity between local and containerized execution; 22. keep deployable project kinds explicit.

### What to build

Build the deployment-facing slice by making `pack` work end to end for `scheduled-job` and `service` projects and by hardening the same command surfaces for non-interactive execution in CI. A maintainer should be able to package a deployable project into an OCI-compatible runtime definition, run it through the container-facing `CodexRunner` shim, and confirm that local and packaged execution produce the same status model, logs, and artifact behavior. This slice should also harden the runner contract enough that adding a second runner later is straightforward rather than invasive.

### Acceptance criteria

- [ ] `pack <project>` works for `scheduled-job` and `service` projects and reports a clear not-applicable result for non-deployable project kinds.
- [ ] Packaged execution uses the same runner request and result contract as local execution, with equivalent run metadata, log semantics, and artifact references.
- [ ] CLI commands needed by CI can run non-interactively with stable exit codes and without conversational dependencies.
- [ ] Runner contract tests cover both successful and failing local versus packaged execution paths for the supported deployable project kinds.

### Validation

- [ ] Package a `scheduled-job` and a `service`, then run both through the container-facing path and compare their outputs against local runs.
- [ ] Execute `run`, `verify`, `pack`, and `doctor` in a non-interactive script context and confirm stable exit-code behavior.
- [ ] Use runner contract tests to confirm that future runner implementations can reuse the same request and result surface without changing project manifests.
