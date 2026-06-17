# TinaCMS Editable Content Audit — Tehuset

## Architecture Note

The site uses **static JSON imports** (no runtime GraphQL). Every Tina-managed file lives in `content/`, imported directly at build time.

---

## 1. Tina Schema Coverage

### Collection: `site` → `content/site.json`

| Field | Type | Status |
|---|---|---|
| `instagramHandle` | string | ✅ used |
| `adminEmail` | string | ✅ used (API route) |
| `contact.email` | string | ✅ used |
| `contact.phone` | string | ✅ editable, never rendered |
| `contact.address` | localized object (sv/en) | ✅ used |
| `contact.socials[]` | object array (label, url) | ✅ editable, never rendered |
| `navigation[]` | object array (key, sv, en, href) | ✅ editable, **never used in code** |
| `hero.title` | localized object | ✅ editable, **never rendered** |
| `hero.intro` | localized textarea | ✅ used |
| `hero.images[]` | image list | ✅ used |
| `sections.about.*` | eyebrow, title, body (all localized) | ✅ used |
| `sections.food.*` | eyebrow, title, body | ⚠️ eyebrow used, title/body **not rendered** |
| `sections.restaurant.*` | eyebrow, title, body | ✅ editable, **none rendered** |
| `sections.merch.title/body` | localized | ✅ used |
| `sections.instagram.*` | eyebrow, title, body | ✅ editable, **none rendered** |
| `sections.footer.*` | eyebrow, title, body | ✅ editable, **none rendered** |
| `history.eyebrow/title/body` | localized | ✅ editable, **title/body not rendered** |
| `history.drawerText` | localized textarea | ✅ used |
| `history.images[]` | image + localized caption + credit | ✅ editable, **never rendered** |

### Collection: `menus` → `content/menu-sv.json` + `menu-en.json`

All fields fully editable and fully used: language, title, background token, `groups[].category`, `groups[].items[].name/description/price`. Item `image` field is defined but never rendered.

### Collection: `products` → `content/products.json`

All fields fully editable and fully used: id, sku, name, description, priceSek, image, active, sizes[].

### Collection: `photography` → `content/photography.json`

`food[]` (4 images) and `restaurant[]` (6 images) — **entire file editable, never used**. Component hardcodes its own image paths instead.

---

## 2. Editable Content Map

### A. Confirmed Editable and Actually Rendered

| Content | Tina field | Component |
|---|---|---|
| Hero intro text | `hero.intro[lang]` | `TehusetHome.tsx:387` |
| Hero images (3) | `hero.images[]` | `TehusetHome.tsx:382` |
| About section copy | `sections.about.body[lang]` | `TehusetHome.tsx:387` |
| Merch section title | `sections.merch.title[lang]` | `TehusetHome.tsx:420` |
| Merch section body | `sections.merch.body[lang]` | `TehusetHome.tsx:421` |
| History drawer text | `history.drawerText[lang]` | `TehusetHome.tsx:277` |
| Contact email | `contact.email` | footer |
| Contact address | `contact.address[lang]` | footer |
| Instagram embed | `instagramHandle` | `TehusetHome.tsx:431` |
| Full menu content | `menus[].groups[].items[]` | `MenuPanel.tsx` (all fields) |
| All product data | `products[].name/desc/price/image/sizes` | `MerchCheckout.tsx` |

### B. Hardcoded — Not Editable

**Images**

- `components/TehusetHome.tsx:8–15` — restaurant showcase: 6 paths hardcoded (`/assets/photography/restaurant-3.jpeg` … `restaurant-8.jpeg`)
- `components/TehusetHome.tsx:17–22` — food showcase: 4 paths hardcoded (`food1.jpeg`–`food4.jpeg`)
- `components/TehusetHome.tsx:394` — elms illustration: `/assets/illustrations/elms-graphic2.png`
- `components/TehusetHome.tsx:407` — castle illustration: `/assets/illustrations/castle-graphic2.png`
- `components/TehusetHome.tsx:462` — footer graphic: `/assets/illustrations/strommen-graphic2-white.png`
- `components/TehusetHome.tsx:372` — logo: `/assets/brand/tehuset-logo-red.png`

**Text (in `ui` object in component)**

- `TehusetHome.tsx:239–240` — `historyCopy`: "Du hittar oss under almarna…" (restaurant section body)
- `TehusetHome.tsx:240–265` — `foodCopy`: "Vår fisksoppa är skapad…" (food section body)
- `TehusetHome.tsx:242–243/267–268` — opening hours: `everyDay` ("Alla dagar"), `openingTime` ("10 - sent")
- `TehusetHome.tsx:225–276` — all 24 UI labels (nav aria-labels, button text, carousel controls, weather states)
- `TehusetHome.tsx:284–327` — 36 WMO weather code → localized label mappings

**Links**

- `TehusetHome.tsx:455` — Google Maps URL: `https://maps.app.goo.gl/UZCKNeLU5SXq3pc7A`
- `TehusetHome.tsx:440` — Instagram profile URL: `https://www.instagram.com/tehuset/`

**Business logic**

- `app/api/swish/payment/route.ts:106–119` — order confirmation and admin email body (both languages, hardcoded strings)

---

## 3. Section Structure Analysis

All sections are **hardcoded in JSX order** in `TehusetHome.tsx`. Section IDs (`top`, `about`, `history`, `food`, `menu`, `merch`, `instagram`, `contact`) are fixed.

| Section | Components | Order | Content control |
|---|---|---|---|
| Hero (`#top`) | Logo, nav, language toggle, weather, images | Hardcoded | Images ✅ CMS; nav labels ❌ code |
| About (`#about`) | Intro text | Hardcoded | ✅ CMS-controlled |
| Restaurant (`#history`) | 6 photos + copy + elms illustration | Hardcoded | ❌ All hardcoded |
| Food (`#food`) | 4 photos + copy + castle illustration | Hardcoded | ❌ All hardcoded |
| Menu (`#menu`) | `MenuPanel` | Hardcoded | ✅ CMS-controlled |
| Merch (`#merch`) | `MerchCheckout` | Hardcoded | ✅ CMS-controlled |
| Instagram (`#instagram`) | Iframe | Hardcoded | ✅ Handle CMS; URL ❌ |
| Footer (`#contact`) | Address, hours, map link, socials | Hardcoded | ✅ Address/email CMS; hours/map ❌ |

---

## 4. Design System

All design tokens are in `styles/globals.css` as CSS custom properties. None are editable via Tina.

| Token | Value | Category |
|---|---|---|
| `--color-bg` | `#FEF1DF` | Color |
| `--color-text` | `#321E0E` | Color |
| `--color-accent` | `#C42026` | Color |
| `--color-on-accent` | `#FFFFFF` | Color |
| `--color-surface-merch` | `#F388A8` | Color |
| `--color-surface-archive` | `#5D80C0` | Color |
| `--font-din` | `'DIN Alternate Tehuset'` | Typography |
| `--font-menu` | `'DIN 1451 Tehuset'` | Typography |
| `--spacing-base` | `48px` | Spacing |
| `--sp-micro/standard/section/major` | `24–144px` | Spacing |
| `--section-pad-x` | `clamp(24px, 6vw, 92px)` | Layout |
| `--max-w-wide` / `--max-w-content` | `1180px / 760px` | Layout |
| `--radius-card` / `--radius-pill` | `36px / 100px` | Shape |
| `--duration-fast/panel/slide` | `180–980ms` | Motion |

To make colors editable: add color fields to the `site` collection, inject as `<style>` in `app/layout.tsx`. All other tokens (typography, spacing, motion) would require CSS-in-JS or a build step — not achievable with static imports alone.

---

## 5. Navigation System

**Defined in:** `content/site.json` (CMS) — three items with `key`, `sv`, `en`, `href`.

**Rendered in:** `TehusetHome.tsx:363–365` — **does not use the CMS data**. Labels come from the hardcoded `ui` object. Anchor `href`s are hardcoded strings (`#contact`, `#about`, `#history`).

The `site.navigation[]` array in Tina is orphaned — it can be edited but has zero effect on the page.

The History link has a special `onClick={openHistoryDrawer}` handler that opens a modal drawer; this cannot be made dynamic without code changes.

**Routing:** Single-page anchor navigation. No dynamic routing. Section IDs are fixed in code.

---

## 6. Critical Gaps

Ranked by how much visible user-facing content is locked out:

| # | Gap | Files affected | Effort | Impact |
|---|---|---|---|---|
| 1 | **Showcase images hardcoded instead of using `photography.json`** | `TehusetHome.tsx:8–22` | Low — just swap array source | High — 10 photos; CMS data already exists and matches |
| 2 | **Restaurant/food section copy hardcoded** (`historyCopy`, `foodCopy`) | `TehusetHome.tsx:239–240` | Low — CMS fields exist (`sections.restaurant/food.body`), just not read | High — main marketing copy for 2 sections |
| 3 | **Opening hours hardcoded** | `TehusetHome.tsx:242–243` | Medium — needs new Tina field (`site.hours`) | High — business-critical info |
| 4 | **`site.navigation[]` defined in Tina but never used** | `TehusetHome.tsx:363–365` | Low fix or Low cleanup | Medium — either wire it up or remove it |
| 5 | **Maps link hardcoded** | `TehusetHome.tsx:455` | Low — add `contact.mapsUrl` to schema | Medium |
| 6 | **Illustration asset paths hardcoded** | `TehusetHome.tsx:394,407,462` | Medium — add image fields to section objects | Medium |
| 7 | **`history.images[]` defined but never rendered** | `TehusetHome.tsx` | Medium — build a display component | Medium — archive photos exist in CMS |
| 8 | **Email templates hardcoded in API route** | `app/api/swish/payment/route.ts:106–119` | Medium | Low–Medium |
| 9 | **All UI labels in component code** | `TehusetHome.tsx:225–276` | High — localization refactor | Low (UI/a11y strings rarely change) |

**Biggest quick win:** Items 1 and 2 together — wiring `photography.json` and `sections.restaurant/food.body` into the component — would activate already-existing CMS data with minimal code changes.
