# Changelog Operations Guide

Operational guide for `/changelog` data generation and publishing.

## Purpose

The changelog page gives Dr. Wong and internal stakeholders a simple historical view of website updates.

Current behavior:
- Displays newest entries first.
- Pagination at 10 cards per page.
- Includes entries from both current and legacy repositories.
- Uses plain-language summaries.

## Source files

- Changelog page:
  - `client/src/pages/Changelog.tsx`
- Generated data:
  - `client/src/data/changelog.ts`
- Generator script:
  - `scripts/generate-changelog.mjs`

## Generator command

```bash
pnpm run changelog:generate
```

This command requires GitHub CLI authentication (`gh auth login`) because it reads commit data through `gh api`.

## Default repository sources

The generator defaults to:
- `enzo-prism/chris-dentist@main|Legacy Website`
- `enzo-prism/chris-nexjs@main|Current Website`

## Optional environment controls

- `CHANGELOG_REPOS`
  - Override repo list and labels.
- `CHANGELOG_LIMIT`
  - Limit total entry count (`0` means no limit).
- `CHANGELOG_OUTPUT`
  - Override output file path.

Example:

```bash
CHANGELOG_LIMIT=200 pnpm run changelog:generate
```

## Update workflow

1. Run `pnpm run changelog:generate`.
2. Confirm `client/src/data/changelog.ts` updates as expected.
3. Verify `/changelog` locally.
4. Commit generated file with other release updates.

## Content style expectations

- Keep title and summary plain and readable.
- Preserve source labels (`Current Website`, `Legacy Website`) for context.
- Do not manually edit `client/src/data/changelog.ts`; regenerate from script.
