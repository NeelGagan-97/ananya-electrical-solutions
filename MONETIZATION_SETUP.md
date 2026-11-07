# Ananya Electrical Solutions — Monetization setup

This feature branch adds homepage partner placements, affiliate/direct campaigns, a token-protected /admin manager, D1-backed campaign storage, click-through redirects, impression/click counts, and an AdSense slot that remains hidden until real IDs are configured.

## Provision Cloudflare D1

From the repository root, run:

```powershell
npx wrangler d1 create ananya-ads
```

Copy the returned database_id. Add a d1_databases array to the top-level wrangler.jsonc object:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "ananya-ads",
    "database_id": "PASTE_REAL_DATABASE_ID_HERE"
  }
]
```

Then apply the schema:

```powershell
npx wrangler d1 execute ananya-ads --remote --file=./migrations/0001_ads.sql
```

## Configure the admin secret

Generate a strong token locally:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

After the Worker code and D1 binding have been deployed, configure the secret:

```powershell
npx wrangler secret put ADMIN_TOKEN
```

Paste the generated token at the prompt. Never commit it or put it in wrangler.jsonc. The secret is available to Worker code through env.ADMIN_TOKEN. The command creates and deploys a Worker version.

Open https://ananyaelectricalsolutions.com/admin and sign in with that token. The token is held in sessionStorage for the current browser tab and cleared when signing out.

## AdSense

Apply at https://adsense.google.com/ and add ananyaelectricalsolutions.com. Google requires original, useful content and policy compliance; approval is not guaranteed. Ads only render after you have an approved site and ad unit.

Add these Vite build environment variables in the Cloudflare build configuration after approval:

- VITE_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
- VITE_ADSENSE_SLOT=1234567890

Use your real publisher and slot IDs. Copy the exact ads.txt line provided by AdSense into public/ads.txt; never publish a sample publisher ID. Verify https://ananyaelectricalsolutions.com/ads.txt.

## Affiliate and direct sponsorship

Apply to affiliate programmes and wait for acceptance before publishing special links or programme creatives. Use only images and brand marks you own or are authorised to display. Keep disclosures close to affiliate links. If accepted into Amazon Associates, include the required site statement: As an Amazon Associate I earn from qualifying purchases.

Direct sponsorship fees and invoices are agreed with advertisers outside the site. The dashboard manages placements and basic impression/click counts; it does not collect payments.

## Deployment order

1. Review this branch and run the project build.
2. Create D1 and apply migrations.
3. Add the real D1 binding to wrangler.jsonc.
4. Merge into main only after build verification.
5. Confirm Cloudflare deployment completed.
6. Set ADMIN_TOKEN as a Worker secret.
7. Test /admin, /api/ads, the homepage banner section, and /go/<campaign-id> redirects.

Do not change the existing custom-domain DNS, nameservers, MX, SPF, DKIM or DMARC records for this work.

## Limitations

- AdSense reporting is separate from the campaign dashboard.
- Impression and click counts are basic event counters, not audited or unique-human analytics.
- Consider protecting /admin and /api/admin/* with Cloudflare Access as an additional security layer.
- The D1 binding and admin secret are intentionally not committed or configured yet.