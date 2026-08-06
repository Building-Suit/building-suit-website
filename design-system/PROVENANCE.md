# Design-token provenance

`design-tokens.source.json` in this directory is an unmodified, byte-identical copy of the canonical Building Suit design tokens.

| Field | Value |
|---|---|
| Source repository | `tareq-abdelwhap/building-suit` |
| Source path | `.docs/building-suit-brand-guidelines/07-design-tokens/design-tokens.json` |
| Source ref | `origin/codex/remove-prototype` |
| Source commit SHA | `d746c578539017caa046a6a34a7f1f949df4356a` |
| Generation date | 2026-08-06 |

Do not hand-edit `design-tokens.source.json`. To pull a newer canonical version, a maintainer with access to the source repository re-copies the file from the approved ref and re-runs `pnpm tokens:sync`, which regenerates `app/assets/css/building-suit-tokens.css` and `design-system.lock.json`. This repository has no runtime git access to the source repository, so sync is an explicit, manual, auditable step — not an automatic build-time fetch.

Run `pnpm tokens:verify` to confirm the generated CSS and the recorded hashes still match the vendored JSON and the logo assets.
