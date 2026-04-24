---
name: prd-to-plan
description: Convert a product requirements document, feature spec, or PRD-like brief into an AI-agent-first phased implementation plan. Use when Codex needs to turn requirements into a Markdown plan in doc/plans/, especially for vertical-slice/tracer-bullet delivery, phased implementation, agent handoff documents, or plans that another coding agent will execute step by step.
---

# PRD to Plan

Convert a PRD into a phased implementation plan optimized for coding agents. Prefer thin vertical slices that prove behavior end-to-end over horizontal phases such as "schema first" or "UI later."

## Workflow

1. Confirm the PRD source.
   - Use the PRD already in the conversation when present.
   - If the PRD is not in context, ask the user to paste it or point to the file.
   - If using a file, read it before planning and capture a brief source identifier for the plan header.

2. Gather enough repository context.
   - Follow project instructions first, including any required memory or workspace-discovery hooks.
   - If the repo uses Nx and an `nx-workspace` skill is available, use it before broad workspace exploration.
   - Inspect the current architecture, integration layers, existing docs/plans, domain models, test patterns, and user-facing surfaces relevant to the PRD.
   - Keep exploration proportional. The goal is to plan against real architecture, not to inventory the whole repo.

3. Extract the planning inputs.
   - Identify user stories, acceptance criteria, non-goals, constraints, domain terms, edge cases, and rollout or migration requirements.
   - Preserve PRD wording for user stories where practical.
   - Mark missing information as an assumption or open question instead of inventing product behavior.

4. Identify durable architectural decisions before slicing.
   - Include only decisions likely to remain stable across the implementation: route and URL patterns, schema/data model shape, auth/authz approach, service boundaries, integration contracts, event/job boundaries, migration strategy, and important testing or rollout constraints.
   - Avoid volatile details such as file names, function names, helper names, or exact internal module boundaries unless the PRD or existing architecture makes them durable.
   - Separate confirmed decisions from assumptions and open questions.

5. Draft vertical-slice phases.
   - Make each phase a narrow, complete path through all required layers for that behavior: persistence, domain logic, API or command surface, UI or adapter, and tests as applicable.
   - Ensure each phase is demoable or independently verifiable.
   - Prefer many thin phases over a few thick phases.
   - Keep each phase focused on user-visible or externally verifiable behavior.
   - Order phases so earlier work reduces integration risk and later phases extend already-proven paths.
   - Avoid pure setup phases unless the setup itself produces a verifiable tracer bullet.

6. Quiz the user on the breakdown before writing the file.
   - Present a numbered list with each phase title and the user stories covered.
   - Ask whether the granularity feels right and whether any phases should be merged, split, reordered, or removed.
   - Iterate until the user approves the breakdown.
   - If the user explicitly asks to skip review or produce the plan immediately, proceed with clearly stated assumptions.

7. Write the plan document.
   - Create `doc/plans/` if needed.
   - Name the file with a concise kebab-case feature slug, for example `doc/plans/v1-first-runnable-loop.md`.
   - Write Markdown using the template below.
   - Keep the plan actionable for a downstream coding agent: clear behavior, stable constraints, acceptance criteria, and validation checks.

## Vertical Slice Rules

- Each phase must deliver a narrow but complete behavior path.
- Each phase must be independently demoable or verifiable.
- Each phase should include tests or validation appropriate to its risk.
- Avoid layer-only phases such as "database schema," "API endpoints," or "frontend screens."
- Do not over-specify volatile implementation details that later phases may change.
- Do include durable names and contracts such as route paths, schema shape, model names, permission concepts, and external service boundaries.

## Plan Template

```markdown
# Plan: <Feature Name>

> Source PRD: <brief identifier or link>

## Architectural Decisions

Durable decisions that apply across all phases:

- **Routes / surfaces**: ...
- **Schema / data shape**: ...
- **Key models**: ...
- **Auth / authorization**: ...
- **Service boundaries**: ...
- **Validation strategy**: ...

## Assumptions And Open Questions

- **Assumption**: ...
- **Open question**: ...

---

## Phase 1: <Title>

**User stories**: <list from PRD>

### What to build

Describe the end-to-end behavior for this slice. Focus on the complete user-visible or externally verifiable path, not a layer-by-layer task list.

### Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

### Validation

- [ ] Relevant test, command, manual check, or demo path

---

## Phase 2: <Title>

**User stories**: <list from PRD>

### What to build

...

### Acceptance criteria

- [ ] ...

### Validation

- [ ] ...
```

## Final Check

Before finishing, confirm the plan:

- Lives under `doc/plans/`.
- Preserves durable architectural decisions near the top.
- Uses vertical slices rather than horizontal implementation layers.
- Maps every in-scope PRD user story to at least one phase.
- Leaves non-goals and unresolved questions visible.
- Is specific enough for an agent to execute, but not brittle about files or function names.
