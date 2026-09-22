# Building Suit Website — project-card centering hotfix

Applies on top of the previous UI hotfix.

## Result

- 1 project: centered.
- 2 projects: side by side.
- 3 projects: first two side by side, third centered.
- Any odd number: the final card is centered on its own row.
- Card width remains capped at the existing 420px; the last card does not stretch across two columns.
- Equal-height card behavior is preserved.
- Mobile remains a normal single-column layout.

## Apply

```bash
cd ~/Repos/building-suit-website
rm -rf /tmp/building-suit-project-centering
mkdir -p /tmp/building-suit-project-centering
unzip ~/Downloads/building-suit-website-project-centering-hotfix.zip -d /tmp/building-suit-project-centering
rsync -av /tmp/building-suit-project-centering/building-suit-website-project-centering-hotfix/ ./
rm -rf .nuxt
pnpm dev
```

No SQL, Supabase, dependency or environment changes are required.
