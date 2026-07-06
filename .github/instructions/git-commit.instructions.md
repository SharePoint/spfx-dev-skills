---
name: Git Commit Message Instructions
description: Generate commit messages that follow the Conventional Commits specification
applyTo: '**'
author: 'Nizar Grindi'
---

# Git Commit Message Instructions

Generate commit messages that follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification. Output **only** the commit message — no explanations, no markdown fences, no AI self-references.

## Core rules

- Format: `<type>(<scope>): <description>`, optionally followed by a body and footer(s), each separated by a blank line.
- Make each commit **atomic**: one logical change per commit.
- Header line: **≤ 50 characters** (hard limit 72), imperative present tense ("add", not "added"/"adds").
- Do **not** capitalize the description's first letter or end it with a period.
- Separate the header from any body or footer with a **single blank line**.
- Add a body **only** when the *why* isn't obvious from the header; wrap at 72 chars and explain *what* and *why*, not *how*.
- Reference work items in a footer:
  - `Closes #123` to **close** the issue on merge (also: `Fixes`, `Resolves`).
  - `Refs #123` to **link without closing** (partial work or tracking only).
- Note breaking changes with a `BREAKING CHANGE: <description>` footer.

## Types

| Type | Use for |
|------|---------|
| `feat` | new feature (MINOR) |
| `fix` | bug fix (PATCH) |
| `docs` | documentation only |
| `style` | formatting/whitespace, no logic change |
| `refactor` | code change that neither fixes a bug nor adds a feature |
| `perf` | performance improvement |
| `test` | adding or correcting tests |
| `build` | build system or dependencies (npm, package.json) |
| `ci` | CI configuration and scripts |
| `chore` | housekeeping that doesn't fit another type (e.g. .gitignore, .vscode/settings.json) |
| `revert` | reverts a previous commit |

## Scopes

Use an optional scope matching the affected area. Omit the scope when no listed area fits.

- `form` — any `*Form` webpart (e.g. `*Form`)
- `dashboard` — any `*Dashboard` webpart (e.g. `*Dashboard`)
- `services` — files under `src/services`
- `common` — shared utilities under `src/common`
- `config` — build, CI, or editor config (package.json, .github/workflows, .vscode)
- `i18n` — translation/localization assets
- `skills` — SPFx skills and related files (SKILL.md, scripts, references)
- `instructions` — instructions files under `.github/instructions`

## Breaking changes

Mark with `!` after the type/scope **and** a footer:
`feat(api)!: remove deprecated field` + `BREAKING CHANGE: <what changed and migration note>`. (MAJOR bump.)

## Examples

```
feat(form): add percentage question validation

Validate percentage answers stay within 0-100 before submission so
invalid responses are never saved to the Responses list.

Closes: #142
```

```
fix(services): handle missing translation key
```

```
chore(i18n): add French translations for dashboard

Refs: #12345
```

```
refactor(dashboard)!: replace status filter enum values

BREAKING CHANGE: responseStatus values were renamed; saved filters
must be reconfigured.

Refs: #12345
```