---
name: write-prd
description: Create rigorous product requirements documents through repo-aware discovery, user interviews, implementation shaping, and test planning. Use when Codex is asked to create, draft, write, refine, or prepare a PRD, product requirements document, feature spec, product plan, implementation brief, or requirements doc for a software feature or product change.
---

# Write PRD

## Overview

Turn a rough product idea into a durable PRD by first understanding the user problem, verifying repository reality, resolving design decisions with the user, and then writing a structured requirements document.

Do not jump straight to the PRD unless the user explicitly asks for a best-effort draft. The main value of this skill is the collaborative clarification loop before writing.

## Workflow

1. Gather the raw idea.
2. Explore the repository and existing documents.
3. Interview the user until the problem, solution, scope, and tradeoffs are clear.
4. Sketch implementation modules and testing strategy.
5. Check the module and testing plan with the user.
6. Write the PRD using the required template.

Skip a step only when it is clearly unnecessary, already satisfied by the conversation, or the user asks for a faster best-effort pass.

## Intake

Ask the user for a long, detailed description of:

- The problem they want to solve.
- The people or systems affected.
- Current workflows and pain points.
- Any solution ideas they already have.
- Constraints, deadlines, preferences, non-goals, and risks.

If the user already provided this, summarize it back briefly and ask only for the most important missing context.

## Repository Discovery

When a repository is available, inspect it before settling the PRD:

- Read applicable local agent instructions first.
- Find related docs, prior PRDs, architecture notes, and task lists.
- Search for existing modules, API surfaces, schemas, tests, and workflows related to the user's claims.
- Verify user assertions against the current codebase before treating them as facts.
- Identify prior art for implementation and testing.

Use repository findings to ask better questions. In the PRD itself, avoid exact file paths and code snippets because they become stale quickly.

## Interview Loop

Interview the user deeply enough to reach shared understanding. Walk the design tree branch by branch, resolving dependencies between decisions before moving on.

Cover these areas as needed:

- Problem: who has the problem, when it happens, how severe it is, and how success will be recognized.
- Users and actors: human users, operators, admins, background jobs, external services, and internal systems.
- Experience: desired workflows, edge cases, permissions, states, notifications, errors, and recovery paths.
- Data: source of truth, lifecycle, schema changes, retention, import/export, auditability, and privacy concerns.
- Integrations: APIs, queues, webhooks, workers, third-party systems, and operational dependencies.
- Constraints: compatibility, migration, rollout, performance, reliability, security, cost, and compliance.
- Scope: what is explicitly included, deferred, or rejected.

Prefer several focused rounds of questions over one overwhelming questionnaire. Keep asking while material ambiguities remain. If the user wants to proceed with unresolved questions, record them in `Further Notes`.

## Module Planning

Before drafting the PRD, sketch the major modules or product surfaces that will need to be built or modified.

Actively look for deep modules: modules that encapsulate substantial behavior behind a small, stable, testable interface. Prefer these over shallow wrappers that mainly pass through data or mirror implementation details.

For each proposed module or surface, clarify:

- Responsibility and boundary.
- Inputs, outputs, and external behavior.
- Dependencies on other decisions.
- Whether it should be tested in isolation.
- Similar prior art found in the repository.

Check with the user that the module plan matches their expectations before writing the final PRD.

## Testing Planning

Ask which modules or behaviors the user expects tests for, and recommend additional tests when risk justifies them.

Use these principles:

- Test external behavior, contracts, and user-visible outcomes.
- Avoid tests that assert implementation details, private helper structure, or incidental call order.
- Prefer isolated tests for deep modules with stable interfaces.
- Add integration or workflow tests where module boundaries, persistence, queues, APIs, or permissions interact.
- Cite prior art by describing comparable test types or project areas, not by embedding fragile file paths.

## PRD Drafting Rules

Write the PRD only after the key decisions are clear or the user explicitly chooses a best-effort draft.

When writing to a repository, use the repository's documented location for project docs. If no convention exists, prefer an existing `doc` or `docs` directory and use a descriptive kebab-case filename.

Use the headings below exactly. Keep the text from the user's perspective where requested. Do not include specific file paths or code snippets in the PRD.

## PRD Template

```markdown
## Problem Statement

The problem that the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## User Stories

A long, numbered list of user stories. Each user story must use this format:

1. As an <actor>, I want a <feature>, so that <benefit>

Make this list extensive enough to cover the feature's main workflows, edge cases, operational states, permissions, errors, and relevant system actors.

## Implementation Decisions

A list of implementation decisions that were made. This can include:

- The modules that will be built or modified.
- The interfaces of those modules that will be modified.
- Technical clarifications from the developer.
- Architectural decisions.
- Schema changes.
- API contracts.
- Specific interactions.

Do not include specific file paths or code snippets.

## Testing Decisions

A list of testing decisions that were made. Include:

- A description of what makes a good test: test external behavior, not implementation details.
- Which modules or behaviors will be tested.
- Prior art for the tests, such as similar types of tests in the codebase.

## Out of Scope

A description of the things that are out of scope for this PRD.

## Further Notes

Any further notes about the feature.
```

## Final Check

Before handing off the PRD, verify that:

- The problem and solution are understandable without the conversation transcript.
- User stories are extensive and concrete.
- Implementation decisions record resolved decisions, not tentative guesses.
- Testing decisions name meaningful behavior to test.
- Out-of-scope items prevent likely scope creep.
- Unresolved questions are either resolved or clearly captured in `Further Notes`.
