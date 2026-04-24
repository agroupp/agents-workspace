---
name: commit-workflow
description: Safely prepare and create focused git commits. Use when the user asks to commit changes, stage and commit work, create a commit message, prepare a clean commit, or automate the local commit process while preserving unrelated work.
---

# Commit Workflow

Create focused commits from the current work while protecting unrelated user changes.

## Workflow

1. Read `AGENTS.md` before changing git state.
2. Run `git status --short` and identify modified, deleted, renamed, and untracked files.
3. Inspect the relevant diff before staging. Use `git diff -- <path>` for tracked files and read untracked files that may be included.
4. Separate intended changes from unrelated work. Never stage broad paths such as `.` or `-A` unless the user explicitly asks to commit everything and the status confirms it is safe.
5. Summarize the intended commit scope from the actual diff.
6. Run relevant verification when the change warrants it. Use the workspace package manager rather than underlying tools.
7. Generate the commit message from the work summary before committing.
8. Stage only the intended files by explicit path.
9. Commit with the generated message.

## Commit Message Template

Every commit message must follow this shape:

```text
{title}
{description}
```

- `{title}`: concise imperative summary of the change.
- `{description}`: one short paragraph explaining what changed and why.
- Generate both fields from the inspected diff and work summary.
- Do not leave either field blank.
- Do not add trailers, signatures, bullets, or extra sections unless the user asks.
- Avoid conventional-commit prefixes unless the repository already uses them or the user requests them.

## Safety Rules

- If unrelated changes are present, leave them unstaged and mention them.
- If a file contains both intended and unrelated edits, stop and ask whether to split the patch unless the user already gave clear instructions.
- If verification fails, stop before committing and report the failure.
- If a required tool or dependency is missing, stop and ask before installing or adding it.
- Do not amend, squash, rebase, reset, or force-push unless explicitly requested.

## Output

After a successful commit, report:

- commit SHA
- commit title
- files staged
- verification run, or that verification was skipped with the reason
