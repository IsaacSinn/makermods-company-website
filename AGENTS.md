# CLAUDE.md

Guidance for AI agents (Claude Code and others) working in this repository.

## Git workflow — required

- **Never push directly to `main`.** The `main` branch is protected by convention; do not commit to it, push to it, or force-push it.
- **Never merge into `main` yourself.** Do not run `git merge` into `main`, and do not merge pull requests. Merging is a human decision.
- **Every change goes through a pull request.** For each new feature, fix, or edit, create a new branch off `main` (e.g. `feature/<short-description>`), commit there, push the branch, and open a PR for review.
- One feature per branch/PR. Keep PRs focused and reviewable.
- Do not create a new branch or new PR, or commit or push without direct permission from the user.

## Commit attribution — required

- **Do not add yourself as a contributor on any commit or push.** Do not add `Co-Authored-By` trailers, `Signed-off-by` lines, or any other author/co-author attribution for the AI agent.
- Commits should be authored solely by the human developer's configured git identity. Do not alter `user.name` or `user.email` to credit an agent.

## Summary

Branch → commit → push branch → open PR. Never touch `main` directly, and never self-attribute commits.
