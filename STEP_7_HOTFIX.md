# Step 7 hotfix — admin DataCloneError + public-page visual parity

This hotfix addresses the two issues found during manual Step 7 testing.

## 1. Why Edit / Save failed

Vue makes objects inside `reactive()` and `ref()` reactive through JavaScript Proxy objects.
The first dynamic build called `structuredClone()` directly on those Proxy objects in the admin page.
Browsers reject that and throw:

`DataCloneError: #<Object> could not be cloned.`

The settings update happened before the failing clone, so a previous Save click may already have updated
Supabase even though the UI stayed stuck on `Saving…`.

The hotfix snapshots admin records into plain JSON data before keeping an original/draft copy and wraps writes
in `try/catch/finally`, so the busy state always resets even if a later operation fails.

## 2. Image upload behavior

Storage upload errors now preserve the actual Supabase error message instead of collapsing to `Upload failed`.
No SQL/migration change is required for this hotfix.

## 3. Public page parity

With all optional customizations empty, the dynamic page now reuses the original public-page composition:

- original Building Suit logo assets from `public/brand`
- original hero scale and spacing
- original flexible vertical spacers
- original gold separator position/size
- original project rail dimensions
- original architectural background geometry
- original pointer parallax/motion behavior
- no newly invented public `AR` floating button

The enhanced project logo and ribbon affect a card only when those optional values are actually configured.
A cover image also changes only the hero composition when a cover exists.

## Apply

From your existing `building-suit-website` checkout:

```bash
# Stop the running dev server first (Ctrl+C).

# Make a local safety snapshot before overlaying the hotfix.
git status
git diff > /tmp/building-suit-before-step7-hotfix.diff

# Extract the hotfix ZIP somewhere temporary, then overlay it.
rm -rf /tmp/building-suit-step7-hotfix
mkdir -p /tmp/building-suit-step7-hotfix
unzip ~/Downloads/building-suit-website-step7-hotfix.zip -d /tmp/building-suit-step7-hotfix
rsync -av /tmp/building-suit-step7-hotfix/building-suit-website-step7-hotfix/ ./

# Nothing new was added to package.json and no migration changed.
# Clear Nuxt's generated state and restart.
rm -rf .nuxt
pnpm dev
```

Then:

1. Hard refresh `/admin`.
2. Click **Edit** on Ledger Suit. The editor must open without DataCloneError.
3. Change one harmless field and click **Save project**. It must return from `Saving…` and show `Project saved.`.
4. Upload an image. If the earlier image is already visible after refresh, do **not** upload it again — the previous request may have succeeded before the old clone exception.
5. Click **Save changes**. It must finish, display `Page settings saved.`, and refresh the preview.
6. Open `/` directly in another tab.
7. For exact old-page appearance, leave Background Image and Cover Image empty and use **Remove from page** for Logo. The original repository logo/background are the fallbacks.

## Optional Supabase verification after the old failed Save

If you want to check whether the previous attempt already persisted, run this in Supabase SQL Editor:

```sql
select
  background_image_url,
  logo_url,
  cover_image_url,
  coming_soon_text_en,
  updated_at
from public.site_settings
where id = 'homepage';
```

Also inspect **Storage → landing-assets** for the image you attempted to upload.
