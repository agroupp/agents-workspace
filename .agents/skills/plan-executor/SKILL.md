---
name: plan-executor
description: Execute implementation plans from doc/plans/ phase by phase. Use when Codex is asked to implement from a plan document, continue a multi-phase plan, choose the next phase from a plan, or coordinate bounded subagents while preserving phase order, validation, and durable handoff state.
---

# Plan Executor

Execute a plan document as a sequence of verified implementation slices rather than as a loose task list.

## Workflow

1. Read project instructions first.
   - Read `AGENTS.md` and `.agents/SNAPSHOT.md` before broad exploration.
   - Read any linked source documents that contain durable constraints, such as decision memos or PRDs.

2. Confirm the execution scope.
   - If the user names a specific phase, work only on that phase unless they ask for more.
   - If the user asks to execute the whole plan, start with the earliest incomplete phase.
   - Do not skip ahead when later phases depend on conventions or contracts established earlier.

3. Turn the active phase into a short execution checklist.
   - Extract the phase goal, acceptance criteria, and validation steps.
   - Identify the repo surfaces likely to change before editing.
   - Keep the checklist local to the active phase rather than planning the full implementation again.

4. Keep one coordinating agent responsible for the phase.
   - Use the main agent to own sequencing, architecture, validation, and integration.
   - Use subagents only for bounded, non-overlapping subtasks inside the active phase.
   - Good delegation examples: isolated module implementation, targeted test additions, or read-only exploration.
   - Bad delegation examples: handing an entire future phase to a subagent, or splitting tightly coupled contract work across multiple agents.

5. Implement in thin verified slices.
   - Prefer the smallest end-to-end slice that can satisfy part of the phase acceptance criteria.
   - Verify after each coherent slice when the change spans multiple files or surfaces.
   - Fix failures before expanding scope.

6. Validate against the plan, not just against intuition.
   - Run the validation items listed for the active phase.
   - Add adjacent checks when needed to protect existing behavior.
   - If a plan acceptance criterion is still unmet, do not mark the phase complete.

7. Update durable state before stopping.
   - Update `.agents/SNAPSHOT.md` with completed work, current in-progress state, known issues, and next steps.
   - If the plan document has checkboxes or status markers and the work now satisfies them, update only the items that are actually complete.
   - Leave clear handoff notes when pausing at a phase boundary or open question.

## Escalation Rules

- Stop and ask the user when an open question in the plan affects a durable contract, such as schema shape, runner behavior, CLI surface, packaging expectations, or workspace conventions.
- Stop and ask before installing missing tools or dependencies.
- Prefer finishing the active phase before proposing extra refactors or unrelated improvements.

## Working Style

- Treat plan documents as execution contracts, not exhaustive implementation specs.
- Preserve the order and intent of the phases unless the user asks to re-plan.
- Keep the repo tool-agnostic; do not introduce mandatory ecosystem choices unless the user explicitly requests them.
- Do not turn plan execution into a general multi-agent framework. Default to one coordinating agent with limited delegation.

## Common Prompts

- `Read doc/plans/<plan>.md and execute the next phase.`
- `Implement Phase 2 from doc/plans/<plan>.md and stop after validation.`
- `Continue this plan in order, using subagents only for bounded parallel work inside the active phase.`
