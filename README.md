# Tehuset Website

Bilingual Next.js App Router website for Tehuset, using TinaCMS content files, Tehuset-only Tailwind color tokens, local DIN fonts, a merch checkout flow with Swish integration hooks, Instagram embed, and Docker self-hosting.

## Reference pass

Before code was written, the Drive references were catalogued and inspected. The local build includes:

- `content/reference-catalog.json` with the downloaded Drive inventory.
- `public/assets/brand/header_reference.png` and `public/assets/brand/tehuset-logo-red.png`.
- all photography and merch images copied into `public/assets/`.
- all three DIN font files copied into `public/assets/fonts/`.

Menu files were present in the references folder as `menu swedish.pdf` and `menu english.pdf`; those PDFs were rendered and used as the visual menu references. The originally requested separate PNG filenames (`menu_sv_reference.png` / `menu_en_reference.png`) were not present. The PDF text did not include prices, so menu price fields exist in TinaCMS but are blank until the client supplies prices.

## Local development

```bash
cp .env.example .env
npm install
npm run dev
```

Open:

- Site: `http://localhost:3000`
- TinaCMS admin: `http://localhost:3000/admin`

Tina runs in local mode through `tinacms dev -c "next dev"` and edits JSON content in `content/` plus assets in `public/assets/`.

## Content editing in TinaCMS

Editable content includes:

- all Swedish and English copy in `content/site.json`
- menu groups and menu items in `content/menu-sv.json` and `content/menu-en.json`
- merch product details in `content/products.json`
- food/restaurant photography in `content/photography.json`
- Instagram handle
- admin email for order confirmations
- contact details, footer text, and social links

All bilingual fields use `sv` and `en` variants. Swedish is the default front-end language.

## Colors and typography

Tailwind is configured with only Tehuset tokens. The site CSS uses these variables exclusively:

- `#FEF1DF` main background
- `#321E0E` main text
- `#C42026` primary/logo accent
- `#E55EA2` pink alternate text
- `#70CCD6` alternate background 1
- `#C6D92D` alternate text 1
- `#F388A8` alternate background 2
- `#CB2027` alternate text 2
- `#DF1F26` footer background
- `#5D80C0` Swedish menu background
- `#D21916` English menu background
- `#FFFFFF` menu text

Fonts are loaded locally only:

- DIN Alternate Regular/Bold for body and UI
- DIN 1451 Std Engschrift for menu panels

## Swish checkout

The merch checkout posts to `POST /api/swish/payment`.

In development, leave:

```env
SWISH_DEMO_MODE=true
```

This creates a demo order response and sends an admin email only if SMTP is configured.

For production Swish, configure:

```env
SWISH_DEMO_MODE=false
SWISH_API_URL=https://mss.cpc.getswish.net/swish-cpcapi
SWISH_PAYEE_ALIAS=YOUR_SWISH_PAYEE_ALIAS
SWISH_CALLBACK_URL=https://your-domain.example/api/swish/callback
```

The current route includes the Swish payment-request payload and instruction UUID flow. A production deployment also needs certificate-backed outbound HTTPS for Swish. In many self-hosted setups this is handled by a small Swish API proxy or mTLS-capable reverse proxy, because the standard `fetch` API does not attach Swish client certificates by itself.

## Admin email

Set SMTP in `.env`:

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=user@example.com
SMTP_PASS=secret
ORDER_EMAIL_FROM=user@example.com
```

The recipient is editable in TinaCMS as `adminEmail` in `content/site.json`.

## Public static preview

A browser-viewable static preview is published with GitHub Pages:

- `https://elias-karlsson.github.io/tehuset-website/`

This preview renders the public site sections from the current content and assets. Dynamic production-only features are not active on GitHub Pages: TinaCMS editing, Swish payment API routes, callbacks, SMTP/order emails, and any server-side integrations still require the self-hosted Next.js/Docker deployment below.

The GitHub Pages artifact is built from `GITHUB_PAGES=true npm run build`, then published from the generated `out/` folder to the `gh-pages` branch.

## Docker deployment

```bash
cp .env.example .env
# edit .env
docker compose up --build -d
```

The compose file mounts `./content` and `./public/assets` into the container so Git-backed content and media can be updated without rebuilding the image.

## Self-hosted production notes

1. Put this folder in a git repository.
2. Configure the TinaCMS auth/content service appropriate for your self-hosted environment and set `NEXT_PUBLIC_TINA_CLIENT_ID`, `TINA_TOKEN`, and branch variables.
3. Configure Swish mTLS/proxy and SMTP.
4. Run `ddocker compose up --build -d` behind your reverse proxy.
5. Keep `content/` and `public/assets/` under version control for git-backed editorial history.
