---
name: session-snapshot
description: Maintain the project memory snapshot in .agents/SNAPSHOT.md. Use when Codex starts work in this repository, needs durable project context, ends a task or session, updates session memory, initializes the snapshot template, or the user mentions snapshot, memory, session summary, or continuity.
---

# Session Snapshot

Maintain `.agents/SNAPSHOT.md` as the durable handoff between sessions.

## Start Workflow

1. Read `AGENTS.md`.
2. Read `.agents/SNAPSHOT.md` before broad project exploration.
3. Use the snapshot as initial context, then verify important facts against repository files before making risky changes.
4. If `.agents/SNAPSHOT.md` is missing or empty, initialize it from the template below.

## End Workflow

Before finishing any task or session:

1. Summarize the completed work in the final response.
2. Update `.agents/SNAPSHOT.md` with the same durable context.
3. Set `Last updated` to the current local date in `YYYY-MM-DD` format.
4. Keep entries concise, current, and actionable.

## Snapshot Template

Preserve this section structure exactly:

```markdown
# Project Snapshot

**Status**: initialization
**Last updated**: YYYY-MM-DD

## What was done

_(must be updated after every session with a short summary)_

## What is in progress

## Known issues

## Next steps
```

## Writing Rules

- Prefer bullets under each section.
- Keep only durable project context. Do not paste logs, transcripts, or verbose explanations.
- Keep `What was done` focused on the latest completed work.
- Use `What is in progress` for active threads, partially completed work, or uncommitted work that future agents should notice.
- Use `Known issues` for blockers, broken checks, missing tools, or uncertainty future agents should verify.
- Use `Next steps` for the next concrete actions an agent can take.
- If a section has nothing meaningful, write `- None currently known.`
- Do not remove user-provided context unless it is stale and replaced by a clearer current fact.
