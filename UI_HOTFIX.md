# Building Suit Website — Project-card + locale switcher hotfix

This patch is applied on top of the Step 7 hotfix.

## Changes

- Ribbon remains an overlay and no longer adds vertical padding to a project card.
- All project cards use equal row heights based on the tallest card in the grid.
- Cards stretch to fill their grid row, so a 2–3-line description makes its peers the same height.
- The public AR/EN language switcher is restored in the same fixed location used by the first dynamic build.
- Mobile projects collapse to one equal-width column.

## Apply

From the repository root:

```bash
unzip ~/Downloads/building-suit-website-ui-hotfix.zip -d /tmp/building-suit-ui-hotfix
rsync -av /tmp/building-suit-ui-hotfix/building-suit-website-ui-hotfix/ ./
rm -rf .nuxt
pnpm dev
```

No SQL, Supabase, environment-variable, or dependency changes are required.
