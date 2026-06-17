# Design System Audit — Tehuset Website

**Date:** 2026-06-12 · **Scope:** read-only audit of `/Users/dougwell/Desktop/website/tehuset-website-main` · **No source files were modified.**

**Method:** three parallel specialist passes — frontend (spacing/typography/components/interactions), UI/UX (color/layout/hierarchy), backend (TinaCMS schema bindings, data flow, payment chain) — synthesized here.

---

## 0. Executive Summary (read first)

1. **Tailwind is configured but 0% adopted.** No `@tailwind` directives in `styles/globals.css`, zero utility classes in any component. The entire `tailwind.config.js` theme (colors, fonts, keyframes `driftIn`/`brushReveal`/`floatCurl`) is dead configuration. All real styling is BEM classes + CSS custom properties in `styles/globals.css` (290 lines).
2. **No Tina runtime client exists.** Content reaches components via direct JSON imports at build time (`app/page.tsx:1-5`, `app/api/swish/payment/route.ts:3-4`). Tina is edit-only: the admin UI writes JSON to disk; the site never queries Tina. JSON file names, JSON key names (= Tina field names), and the prop pipeline in `page.tsx` are all hard contracts.
3. **Significant dead surface:** `components/ImageFlow.tsx` is never imported; `.history-archive*`, `.section-block--blue`, `.language-toggle--light` CSS has no live markup; `content/photography.json` is imported but never passed to any component (carousels use hardcoded arrays at `components/TehusetHome.tsx:8-22`); `content/reference-catalog.json` matches no Tina collection and is imported by nothing.
4. **Two parallel spacing token systems** coexist with three value collisions (24/48/96px). The `--sp-*` + clamp system is dominant and canonical.
5. **One live rendering bug found:** `.footer__bottom` (`styles/globals.css:220`) mixes dark brown text over the red footer (~2.5:1 contrast) — every sibling rule uses white. Almost certainly a copy-paste from a cream-background context.
6. **One latent crash:** `site.sections.merch.title![lang]` (`components/TehusetHome.tsx:419`) — deleting the merch title in Tina crashes the page.

---

## 1. Raw Inventory

### 1.1 Spacing

All spacing lives in `styles/globals.css`. No Tailwind spacing classes, no inline spacing styles (inline styles are transforms/animation-delay only: `TehusetHome.tsx:115`, `ImageFlow.tsx:13`).

**System A — 4px scale** (`globals.css:20-28`): `--space-1` (4px) … `--space-9` (96px).
**System B — 48px base scale** (`globals.css:29-42`): `--spacing-base: 48px`; `--sp-micro` 24px, `--sp-standard` 48px, `--sp-section` 96px, `--sp-major` 144px; derived clamps `--section-pad-x`, `--section-y`, `--section-y-compact`, `--copy-gap`, `--grid-gap`, `--module-gap`, `--card-pad`, `--showcase-edge-bleed`, `--mobile-pad-x`.

Collisions: `--space-5` ≡ `--sp-micro` (24px); `--space-7` ≡ `--sp-standard` (48px); `--space-9` ≡ `--sp-section` (96px).

| Token | Value | Uses | Where (file:line in globals.css unless noted) | Flag |
|---|---|---|---|---|
| `--space-1` | 4px | 3 | L142, L156, L253 | — |
| `--space-2` | 8px | 4 | L179, L188, L189, L211 | — |
| `--space-3` | 12px | 8 | L93, L114, L129, L142, L187, L256, L261, L277 | — |
| `--space-4` | 16px | 6 | L58, L154, L189, L254, L268 | — |
| `--space-5` | 24px | 1 | `.instagram-lockup` gap L200 | **LOW_FREQUENCY** + duplicates `--sp-micro` |
| `--space-6` | 32px | 2 rules | L122, L125 — dead ImageFlow only | **LOW_FREQUENCY** (dead) |
| `--space-7` | 48px | 2 | L232, L283 | **LOW_FREQUENCY** + duplicates `--sp-standard` |
| `--space-8` | 64px | 1 | L283 | **LOW_FREQUENCY** |
| `--space-9` | 96px | 0 | — | **DEAD TOKEN** |
| `--sp-micro` | 24px | ~18 | L64, L89, L148, L151, L165, L170, L177, L185, L197, L206, L213, L216, L220, L245, L261, L272, L275 | **Most-used spacing token — de facto canonical** |
| `--sp-standard` | 48px | ~9 | L86, L95, L105, L245, L255, L266, L272, L273 | — |
| `--sp-section` | 96px | ~5 | L35, L62, L86, L266, L272 | — |
| `--sp-major` | 144px | 2 | clamp max only, L35, L62 | LOW_FREQUENCY (clamp-only) |
| `--copy-gap` | =`--sp-micro` | 5 | L124, L137, L161, L197, L208 | Alias — indirection only |
| `--grid-gap` | clamp(24px,3vw,48px) | 5 | L77, L108, L125, L138, L163 | — |
| `--module-gap` | clamp(48px,5vw,96px) | ~11 | L77, L116, L122, L135, L149-150, L159, L205-207, L227 | — |
| `--section-pad-x` | clamp(24px,6vw,92px) | ~9 | L57-58, L97, L100, L134, L145, L158, L206, L227 | — |
| `--section-y` | clamp(96px,10vw,144px) | 5 | L97, L121, L134, L145, L158 | — |
| `--section-y-compact` | clamp(48px,7vw,96px) | 4 | L57-58, L100, L206 | — |
| `--card-pad` | clamp(16px,2.5vw,32px) | 2 (1 live) | L139 (dead), L163 | **LOW_FREQUENCY** |
| `--showcase-edge-bleed` | clamp(24px,5vw,96px) | 3 | L101, L103, L227 | — |
| `--mobile-pad-x` | 18px | 6 | L245, L266, L267×2, L272, L283 | **18px is off both scales** |

**Raw (un-tokenized) spacing — all LOW_FREQUENCY:** `.42rem .62rem` (L52 toggle buttons), `clamp(8px,1vw,16px)` (L64), `.42em` (L66), `clamp(18px,2.2vw,32px)`/`clamp(18px,2.8vw,42px)` (L61), `clamp(28px,4.7vw,76px)` (L86), `clamp(14px,2.2vw,30px)`/`clamp(16px,2.6vw,36px)` (L88), `.35rem` (L170), `.8rem 1rem` (L171 input), `.8rem 1.2rem` (L172 brush-button), `0 0 .45rem` (L178), `.55rem .8rem` (L180 size option), `.4rem`/`.2rem .5rem` (L192), `.5rem 1rem` (L194).

**Pattern:** structural/layout spacing is tokenized and consistent; *control-level* spacing (buttons/inputs) is ten distinct raw rem values across six controls with no shared scale.

### 1.2 Typography

**Families:** `DIN Alternate Tehuset` (`--font-din`, weights 400/700) — site default via `body` (L47); `DIN 1451 Tehuset` (`--font-menu`, 400) — menu panel only (L145). Tailwind `font-din`/`font-menu` aliases: unused.

**Font sizes (complete):** 18px body base (L47); micro: `.72rem` (L52), `.76rem` (L143 dead), `.8rem` (L129 dead), `.86rem` (L220), `.88em` (L74), `.9rem` (L193, L271), `1rem` (L172, L180, L192, L194), `1.03rem` (L256), `1.25rem` (L115), `2rem` (`.price` L169). Fluid: `clamp(.8rem,1.04vw,1.08rem)` L156; `clamp(1.03rem,1.35vw,1.28rem)` L137 (dead); `clamp(1.05rem,1.45vw,1.35rem)` L124 (dead)/L162; `clamp(1.05rem,1.28vw,1.35rem)` L209; `clamp(1.08rem,1.58vw,1.55rem)` L64; `clamp(1.08rem,1.65vw,1.55rem)` L95; `clamp(1.08rem,1.76vw,1.72rem)` L155; `clamp(1.1rem,1.5vw,1.45rem)` L197 (dead); `clamp(1.17rem,1.59vw,1.54rem)` L118; `clamp(1.2rem,2vw,1.6rem)` L186; `clamp(1.76rem,3.84vw,3.68rem)` L152; `clamp(1.85rem,4.15vw,4.45rem)` L98; `clamp(2rem,3.2vw,3.6rem)` L58/L201/L204/L208; `clamp(2rem,4vw,4rem)` L166; `clamp(2rem,3vw,3.3rem)` L88; `clamp(2.25rem,5.8vw,5.1rem)` L136 (dead); `clamp(2.35rem,6.4vw,5.65rem)` L123; `clamp(3rem,7.2vw,7.7rem)` L94 (mobile L285); `clamp(3.2rem,8vw,7.2rem)` L149; mobile-only L253, L276.

**Weights:** only 400 and 700 exist. 700 is the dominant voice (nav, copy paragraphs, all buttons, labels, eyebrows, price). 400: entire menu panel, drawer close glyph, archive small (dead), swish `dt`.

**Line-heights (15 distinct):** .72, .86, .88, .9, .95, .96, 1, 1.08, 1.12, 1.15, 1.18, 1.2, 1.22, 1.3 — display headings cluster .86–.96; body copy 1.08–1.3.

**Letter-spacing (16 distinct):** body `.01em`; tight display `-.035em` to `-.06em`; spaced caps `.02em` to `.14em`.

**De facto hierarchy:**

| Role | Implementation | Source |
|---|---|---|
| H1 | **None — no `<h1>` exists.** Hero identity is `<img class="hero__logo">` (`TehusetHome.tsx:371`) | SEO/a11y gap |
| Display H2 | `clamp(3rem,7.2vw,7.7rem)` 700 lh .86 ls -.06em | `.history-drawer__copy h2` L94; menu variant `clamp(3.2rem,8vw,7.2rem)` 400 DIN 1451 L149 |
| Section H2 | `clamp(2.35rem,6.4vw,5.65rem)` 700 lh .88 ls -.058em | `.section-block h2` L123 (live: merch `TehusetHome.tsx:419`) |
| Sub-section H2 | `clamp(2rem,3.2vw,3.6rem)` 700 lh .9 ls -.04em | footer columns L208; same scale as hero nav L58 |
| H3 | `clamp(2rem,4vw,4rem)` 700 (merch L166) vs `clamp(1.76rem,3.84vw,3.68rem)` 400 (menu L152) | context-split |
| H4 | `clamp(1.08rem,1.76vw,1.72rem)` 400 | menu items L155 |
| Lead body | `clamp(1.85rem,4.15vw,4.45rem)` 700 | `.intro-copy p` L98 |
| Emphasis body | `clamp(1.08–1.17rem … 1.54–1.55rem)` 700 uppercase | showcase L118, drawer L95, footer L209 |
| Plain body | 18px / `clamp(1.05rem,1.45vw,1.35rem)` 400 | body L47, `.section-block__copy p` L162 |
| Caption/micro | `.72/.76/.8/.86/.9rem` — five values, each 1–2 uses | toggle, archive (dead), figcaption (dead), footer bottom, hints |

### 1.3 Color

No Tailwind color classes anywhere; all color is in `globals.css` via vars or `color-mix()`.

| Value | Variable | Live uses | Status |
|---|---|---|---|
| `#FEF1DF` cream | `--color-bg` (L6) | ~19 | **CANONICAL** ground |
| `#321E0E` brown | `--color-text` (L7) | ~15 | **CANONICAL** ink |
| `#C42026` red | `--color-accent` (L8) | ~23 | **CANONICAL** brand red |
| `#C42026` | `--color-footer` (L14) | 1 — dead code only (L55) | **ORPHAN variable** (value canonical) |
| `#C42026` | `--color-menu-sv` (L15) / `--color-menu-en` (L16) | 1 each (L146/L147) | Redundant aliases (C2) |
| `#C42026` raw literal | — | 1 (`.footer` L206) | Bypasses its own variable |
| `#FFFFFF` | `--color-menu-text` (L17) | ~18 | **CANONICAL** text-on-red (misnamed: used far beyond menus) |
| `#E55EA2` pink | `--color-pink-text` (L9) | 0 | **ORPHAN — fully dead** |
| `#70CCD6` teal | `--color-alt-bg-1` (L10) | 1, dead component only (L130) | **ORPHAN (dead)** |
| `#C6D92D` lime | `--color-alt-text-1` (L11) | 1, dead (L131) | **ORPHAN (dead)** — lime-on-teal was ~1.5:1 contrast; do not revive |
| `#F388A8` pink bg | `--color-alt-bg-2` (L12) | 1 (L159, live merch section) | ORPHAN by count — **keep** (intentional alt surface) |
| `#CB2027` red | `--color-alt-text-2` (L13) | 2 (L159-160, live merch) | **ORPHAN + near-duplicate of #C42026** |
| `#5D80C0` blue | — raw literal | 1 (L86, history drawer bg) | ORPHAN by count — **keep** (drawer identity, only non-brand live color) |
| `#000` raw | — | 2 (L84, L86 — color-mix scrim/shadow) | functional |

**Derived `color-mix()` recipes — 17 occurrences, 11 distinct:** nine distinct transparency percentages on `--color-text` alone (12/15/18/25/80/84/86/88/90%) — four serve shadows differing by 2–4% imperceptibly. Two placeholder tints: `bg+white 28%` (L78, live) vs `42%` (L128, dead).

**Near-duplicate groups:** GROUP RED `#C42026` vs `#CB2027` (ΔE≈1–2, perceptually identical); GROUP SHADOW text@84/86/88/90%; GROUP PLACEHOLDER 28% vs 42%.

**TINA_BOUND:** No color or layout values are stored in CMS content (verified across all `content/*.json` and `tina/config.ts`). One adjacent item: `tina/config.ts:52` declares a `background` string field ("Background token") populated as `"swedishMenu"`/`"englishMenu"` (`menu-sv.json:4`, `menu-en.json:4`) — **TINA_BOUND, never read by code** (`MenuPanel.tsx:5` branches on `menu.language` instead). Preserve the JSON values; the CSS vars they were meant to select are free to collapse. Note: `content/reference-catalog.json:15-18` points to a brand source-of-truth "HEX codes tehuset.txt" on Google Drive — check it before finalizing the palette.

### 1.4 Layout

**No shared container class.** Every section rolls its own width.

Wide containers: `max-width:1180px` (`.menu-panel__grid` L150, live), `min(1180px, calc(100% - 64px))` (L125, dead), `min(1120px,100%)` (`.footer__columns` L207), `min(1100px,86vw)` (`.hero__image-strip` L77), `min(1080px,100%)` (L138, dead). **Four near-identical wide widths, no canonical value.**

Copy containers: 860px (`.intro-copy p` L98), 820px (dead L135), 760px (`.history-drawer__copy` L92, `.footer__mark` L218, dead L122), 740px (dead L197), 720px (L94), 690px (L95), 680px (dead L137), 620px (dead L124), **529px** (`.showcase__copy p` L118 — hand-tuned one-off), `min(560px,86vw)` (L62), `min(540px,100%)` (iframe L205), 340/320px (swish L188/L193).

Special: `.showcase__deck min(874px,66.7vw)` (L105) with bespoke 1025–1440px breakpoint calc (L226-228); `.history-drawer__panel` 75vw → 100vw mobile (L86/L283); `.showcase__graphic min(362px,51.75vw)` (L117).

**Section rhythm (the strongest part of the codebase):** `--section-pad-x` horizontal gutter + `--section-y` (tall) / `--section-y-compact` (hero, showcase, footer) used consistently. Divergences: dead ImageFlow used a second gutter system; mobile introduces `--mobile-pad-x: 18px` on *some* sections (hero/showcase/footer/drawer) while others stay at the clamp's 24px floor — **two competing mobile gutters, visible as misaligned left edges on phones.**

**Section boundaries (canonical pattern):** full-bleed background-color changes, zero dividers, `margin-top: 0` enforced. Live sequence: cream hero → cream intro → cream showcase ×2 → red menu (100svh) → pink merch → cream instagram → red footer (100svh). Color blocking *is* the section language.

**Grids:** hero strip 3-col `.92fr 1.48fr .92fr` → 2-col ≤780; showcase 2-col asym `1.18fr/.82fr` (+ mirrored) → 1-col ≤1024; menu/archive `repeat(2,minmax(260px,1fr))` → 1-col; merch `.8fr/1.2fr` and `.8fr/1fr`; footer `repeat(3,1fr)` → 1-col. **Minor bug:** `globals.css:260` sets `grid-template-columns:1fr` on `.footer` (a row-grid) — no-op, intended for `.footer__columns`.

**Alignment:** hero nav is the only left-aligned element (absolute, L58); everything else is centered + max-width-capped + full-bleed color block. Mobile re-sequences sections via flex `order` (L244-252) — DOM order ≠ visual order (tab-order/screen-reader divergence noted).

**Radius (live values):** 36px (merch-card), 28px (merch img, iframe), 24px (qr), 9px/26% (instagram marks), 8px (`.swish-pay__copy`), 999px (all pills), 18px (brush-button hover corner). Dead: 32/34px.

### 1.5 Components (patterns implemented more than once)

| # | Pattern | Instances | Differences | TINA_BOUND? |
|---|---|---|---|---|
| A | **Pill control** (radius 999px) | 6: language toggle L51, showcase controls L115, drawer close L88, input L171, brush-button L172, size option L180 | Border 1.5px vs 2px; padding all different; target size 25px→56px; hover only on 2 of 6 | No |
| B | **Circular icon button** | showcase controls (39px fixed, font 1.25rem, 700) vs drawer close (clamp 42–56px, font clamp(2rem,3vw,3.3rem), 400) | size system, weight, hover (neither has one; close lacks transition) | No |
| C | **ShowcaseSection** | One component, 2 instantiations (`TehusetHome.tsx:389-400`, `:402-413`) with `imageSide` variant (L100-118) | Clean parameterization | **No — but should be**: text comes from hardcoded `ui.historyCopy`/`ui.foodCopy` while equivalent TINA fields `site.sections.{restaurant,food}.body` exist unrendered |
| D | **Eyebrow label** | `.eyebrow` L120 (accent, ls .12em) vs `.history-drawer__eyebrow` L93 (currentColor, ls .14em, +margin) | only drawer instance live; its text "Tehuset archive" is hardcoded English while `site.history.eyebrow` (TINA_BOUND) sits unused | Field exists, unbound |
| E | **Instagram glyph** | footer icon (L213-215: fixed 34px/3px/9px) vs lockup (L201-203: clamp sizing, 26% radius, % proportions) | same glyph, two sizing systems | No |
| F | **Section wrapper** | `.section-block` (+`--pink`) used once live; `.instagram-block` is a section-block with ad-hoc overrides; hero/intro/showcase/menu/footer each self-pad from same tokens | consistent tokens, no shared class | No |
| G | **Card** | `.merch-card` (36px/shadow `0 28px 90px`), `.swish-pay__qr` (24px), iframe (28px); dead: archive card (34px, `0 22px 72px`), image-flow card (32px, `0 24px 80px`) | five radii + three near-identical shadows for one elevation idea | merch-card content is TINA_BOUND (`products.json`) |
| H | **Localization mechanism** | `tr(sv,en)` helper (`MerchCheckout.tsx:31`) vs `ui` dictionary (`TehusetHome.tsx:220-275`) vs `labels` map (`LanguageToggle.tsx:5-8`) | three patterns for one job | `ui` strings duplicate unrendered TINA fields |

**TINA_BOUND component/prop map** (binding = JSON key = Tina field name; full data-layer detail in §4):
`site.hero.images` → hero strip (`TehusetHome.tsx:381`); `site.sections.about.body`/`site.hero.intro` → intro (`:386`); `site.sections.merch.title/body` → merch (`:419-420`, `!` assertion on title); `site.history.drawerText/body` → drawer (`:276`); `site.contact.email/address`, `site.instagramHandle` → footer/iframe; `site.adminEmail` → payment route (server); `menu-sv/en.json` → MenuPanel (incl. `language` value selecting CSS class — **content value acting as styling variant**); `products.json` (`id/name/description/priceSek/image/active/sizes`) → MerchCheckout + payment route.

**Dead/disconnected (audit-critical):** `ImageFlow.tsx` (never imported) + its CSS L121-132 + keyframes `railDrift` L126, `floatCurl` L223; `.history-archive*` L134-143 (its TINA field `site.history.images` is unrendered); `.section-block--blue` L195-198; `LanguageToggle tone='light'` (L54-55, never passed); Tailwind keyframes block; `--space-9`, `--color-pink-text`; `menu.background` field (TINA_BOUND, unread); `site.navigation` (TINA_BOUND, unread — nav hardcoded `TehusetHome.tsx:362-364`); `content/photography.json` (imported `page.tsx:2`, never passed); `content/reference-catalog.json` (not CMS content — Google Drive asset manifest); `ui.shopEyebrow`/`ui.instagramEyebrow`; `monte-hero` class (`TehusetHome.tsx:360`, no CSS exists).

### 1.6 Interactions

**Transitions:**

| Element | Property | Duration | Easing | Line |
|---|---|---|---|---|
| `.hero__nav a` | color / transform | 180ms / 220ms | ease | L59 |
| drawer backdrop | opacity | 230ms | `cubic-bezier(.16,1,.3,1)` | L84 |
| drawer panel | transform | 240ms | `cubic-bezier(.16,1,.3,1)` | L86 |
| showcase rail | transform | 980ms | `cubic-bezier(.16,.84,.24,1)` | L112 (JS `slideDurationMs = 980`, `TehusetHome.tsx:32`) |
| `.brush-button` | transform + radius | 900ms | `cubic-bezier(.22,.88,.24,1)` | L172 |
| `.merch-sizes__option` | bg/color/transform | 160ms | ease | L180 |
| dead (Tailwind + ImageFlow) | — | 1200/1400/8200/9600ms | 3+ more beziers | tailwind.config.js:30-32, globals.css:127 |

**Six distinct easings, ten distinct durations, four live interaction families. No `--ease`/`--duration` tokens.**

**Hover:** nav links (color + `translateX(4px)`), brush-button (`translateY(-3px) rotate(-1deg)` + radius morph), size option (`translateY(-2px)`). **No hover at all:** showcase controls, drawer close, footer links, mailto, instagram lockup, swish buttons — lift-on-hover for some buttons, nothing for others.

**Focus:** **zero custom `:focus`/`:focus-visible` rules in the entire stylesheet.** Drawer close gets programmatic `.focus()` + `tabIndex` gating (`TehusetHome.tsx:188,198,200`) — good — but visible focus appearance is browser-default. WCAG 2.4.11 risk on red/blue backgrounds.

**Other:** Escape-to-close + scroll lock + backdrop click for drawer; `prefers-reduced-motion` covers drawer only (L288-290) — **rail slide, brush morph, and `html { scroll-behavior: smooth }` (L46) are not gated.** Target sizes: language toggle ≈25px and `.swish-pay__copy` ≈24px at the WCAG 2.5.8 floor; showcase controls 39px; brush/size buttons 48px OK. Copy-to-clipboard with 1800ms feedback (`MerchCheckout.tsx:56-65`).

---

## 2. Conflicts & Ambiguities

### CONTRADICTIONS

| # | Conflict | More frequent | TINA_BOUND? | Recommended resolution |
|---|---|---|---|---|
| C1 | **Two brand reds**: `#C42026` (~28 refs) vs `#CB2027` (2 refs, live merch text). ΔE≈1. | `#C42026` | No | Collapse to `#C42026` (it's the logo red). Note: red-on-pink merch text is ~2.4:1 either way — fails WCAG AA; fixing needs a new value, so flag-only here. |
| C2 | **Four names + one raw literal for the same red**: `--color-accent`, `--color-footer`, `--color-menu-sv`, `--color-menu-en`, raw `#C42026` at L206. | `--color-accent` | The `background` CMS field that was meant to drive menu vars is TINA_BOUND but unread | Keep `--color-accent` as the single red token; delete the three aliases; replace L206 literal with the var. Preserve the JSON `background` values (schema declares them). |
| C3 | **Footer bottom text wrong-system**: L220 mixes brown over red (~2.5:1, visibly muddy); all sibling rules use white. | white-on-red (5+ rules) | No | Switch to `color-mix(in srgb, var(--color-menu-text), transparent 12%)` — muted white was clearly the intent. **This is a live bug fix, not a style choice.** |
| C4 | **Wide container width**: 1080/1100/1120/1180px across five sections. | 1180 (2×, serves densest grid) | No | Standardize `MAX_WIDTH_WIDE = 1180px`; 1100/1120 sections are fluid `min()` containers and can grow without breakage; hero keeps its `86vw` guard. |
| C5 | **Two mobile gutters**: `--mobile-pad-x: 18px` (hero/showcase/footer/drawer) vs `--section-pad-x` 24px floor (intro/menu/merch/instagram) — misaligned left edges on phones. | 24px floor (more live sections) | No | Set `--mobile-pad-x: 24px`. |
| C6 | **Dual spacing token systems** (`--space-1..9` vs `--sp-*`) with three value collisions. | `--sp-*` + clamps (~50 uses vs ~25) | No | Keep `--sp-*`/clamp system for layout; keep `--space-1..4` for micro-gaps; delete `--space-5..9` (remap L200→`--sp-micro`; L232, L283→`--sp-standard`; L283 top 64px → see AMBIGUITY A3). |
| C7 | **`floatCurl` defined twice** (globals.css 9600ms vs tailwind.config 8200ms), both dead. | neither live | No | Delete both with the dead ImageFlow; if revived, keep only the CSS one (Tailwind version is unreachable). |
| C8 | **Tailwind configured, 0% adopted.** | hand-rolled CSS (100%) | No | Remove Tailwind from the build (config + postcss wiring). 290 lines of coherent token-driven CSS is the working system; a second dead system invites drift. |
| C9 | **Showcase copy hardcoded while equivalent CMS fields exist**: `ui.historyCopy`/`ui.foodCopy` render; `site.sections.restaurant/food.body` (TINA_BOUND, in site.json) silently do nothing. Same for showcase image arrays vs orphaned `photography.json`. | hardcoded version (it renders) | **Yes** — CMS side | Wire `ShowcaseSection` text to `site.sections.{restaurant,food}.body[lang]` with `ui` strings as fallback; wire images to `photography.json` (with empty-array guard — see R-S7). Editors currently edit fields that do nothing — worst kind of contradiction. |
| C10 | **`site.navigation` (TINA_BOUND) ignored**; nav hardcoded at `TehusetHome.tsx:362-364`; hrefs disagree (`#footer` in JSON vs `#contact` in code; no `id="footer"` exists). | hardcoded (renders) | **Yes** | Render from `site.navigation` mapped by `key` (History needs the drawer `onClick`), fix `#footer`→`#contact` in content; or prune the field from the schema. |
| C11 | **Eyebrow duplicated**: `.eyebrow` (ls .12em) vs `.history-drawer__eyebrow` (ls .14em + margin); drawer text hardcoded English while localized `site.history.eyebrow` exists. | drawer instance (only live one) | Field exists, unbound | One `.eyebrow` class; drawer adds margin via own selector; bind text to `site.history.eyebrow[lang]`. |
| C12 | **Circular icon buttons differ arbitrarily** (39px/700 vs clamp 42–56px/400). | carousel (4 buttons) | No | Shared `.icon-button` base at clamp(42px,4.2vw,48px), 2px border, one font treatment (39px has no touch-target headroom). |
| C13 | **Menu color variant is a no-op**: `--color-menu-sv` ≡ `--color-menu-en`; class switched on `menu.language` while the TINA_BOUND `background` field is ignored. | — | **Yes** (field + `language` value) | Collapse to one `--color-menu` var; keep the `--sv/--en` class derivation (it's keyed off content) but make both resolve identically; do not strip schema/JSON without a deliberate schema change. |

### AMBIGUITIES — flagged, NOT to be normalized in Session 2

| # | Pattern | Why it's a judgment call |
|---|---|---|
| A1 | `--mobile-pad-x: 18px` | Off both scales — optical tuning or drift? (C5 resolves the *split*; whether 24 is right needs visual QA) |
| A2 | `.swish-pay__copy` radius 8px | Only small-radius element on the site (1 use) |
| A3 | Drawer mobile padding `--space-8`/`--space-7` 64/48px asymmetry (L283) | Only co-occurrence of those tokens; deliberate? |
| A4 | `.instagram-lockup` gap `--space-5` | Single use of that token where `--sp-micro` is used everywhere else |
| A5 | Global `label`/`input` selectors (L170-171) | Style ALL forms site-wide though only MerchCheckout has forms — scoping decision |
| A6 | Drawer blue `#5D80C0` | Intentional "blueprint archive" mood or placeholder? Check brand "HEX codes tehuset.txt" on Drive first |
| A7 | Merch pink `#F388A8` | Reads intentional, single occurrence — confirm it's a brand color |
| A8 | Two near-identical body clamps (L162 vs L209: same bounds, different vw slope) | Likely one token, but slope difference may be tuned |
| A9 | Five micro caption sizes (.72/.76/.8/.86/.9rem) | Consolidation target depends on design intent |
| A10 | Missing `<h1>` | Fix = visually-hidden `<h1>` bound to TINA `site.hero.title` — content/SEO decision |
| A11 | `prefers-reduced-motion` coverage | Gating carousel + smooth-scroll recommended but product call |
| A12 | `.showcase__copy p` 529px / `.showcase__graphic` 51.75vw | Sub-pixel-precise, hand-tuned to illustration assets — round only with visual QA |
| A13 | Intro 860px vs 760px copy measure | Display-size type justifies a wider measure; one tier vs two is a call |
| A14 | `.history-drawer__panel` 75vw | Only drawer; no pattern to normalize against |
| A15 | Red-on-pink merch contrast (~2.4:1) | Fixing requires inventing a darker value — out of scope for extraction (see C1) |

---

## 3. Design System Tokens

All values below already exist in the codebase. **Nothing is invented** (the responsive multipliers requested are expressed via the existing clamp() system where possible; computed static fallbacks shown).

### 3.1 Spacing Scale

**SPACING_BASE = 24px** (`--sp-micro` — the single most-used spacing token, ~18 live uses). The codebase's own `--spacing-base: 48px` is 2× this unit; the full live scale is built from 4/8/12/16/24/48/96/144.

| Token | Source | Desktop (1×) | Tablet (0.875×) | Mobile (0.75×) |
|---|---|---|---|---|
| `xs` | `--space-1` (4px) | 4px | 3.5px | 3px |
| `sm` | `--space-2` (8px) | 8px | 7px | 6px |
| `md` | `--space-3`/`--space-4` cluster (12–16px; canonical 16px) | 16px | 14px | 12px |
| `lg` | `--sp-micro` (24px) — **BASE** | 24px | 21px | 18px |
| `xl` | `--sp-standard` (48px) | 48px | 42px | 36px |
| `2xl` | `--sp-section` (96px) | 96px | 84px | 72px |
| `3xl` | `--sp-major` (144px) | 144px | 126px | 108px |

**Implementation note:** the codebase already achieves responsive scaling via `clamp()` (e.g. `--section-y: clamp(96px, 10vw, 144px)`), which is superior to breakpoint multipliers — keep the clamps as the delivery mechanism; the table above is the static-equivalent reference. Note `lg` mobile (18px) coincidentally equals the current `--mobile-pad-x` — but C5 standardizes the mobile gutter to 24px; the 18px row value is the *general* mobile multiplier, not the gutter.

Derived tokens retained as-is: `--grid-gap clamp(24px,3vw,48px)`, `--module-gap clamp(48px,5vw,96px)`, `--section-pad-x clamp(24px,6vw,92px)`, `--section-y clamp(96px,10vw,144px)`, `--section-y-compact clamp(48px,7vw,96px)`, `--card-pad clamp(16px,2.5vw,32px)`.
Deleted: `--space-5..9` (collisions/dead), `--copy-gap` (alias of `lg`).
**Control spacing (new tier from most-frequent existing values):** button padding `.8rem 1.2rem` (brush-button), input padding `.8rem 1rem`, compact control `.55rem .8rem` (size option) — the other seven raw rem one-offs map to these with visual QA.

### 3.2 Typography Scale

Family: `--font-din` everywhere; `--font-menu` reserved for `.menu-panel`. Weights: 400, 700 only (nothing else is loaded).

| Token | font-size | weight | line-height | letter-spacing | Derived from |
|---|---|---|---|---|---|
| `h1` | `clamp(3rem, 7.2vw, 7.7rem)` | 700 | .86 | -.06em | `.history-drawer__copy h2` L94 — largest live display treatment. (No `<h1>` exists today; see A10.) |
| `h2` | `clamp(2.35rem, 6.4vw, 5.65rem)` | 700 | .88 | -.058em | `.section-block h2` L123 (live merch heading) |
| `h3` | `clamp(2rem, 3.2vw, 3.6rem)` | 700 | .9 | -.04em | footer column h2 L208 / hero nav L58 (most frequent mid-display size: 4 uses) |
| `h4` | `clamp(1.2rem, 2vw, 1.6rem)` | 700 | 1.15 | .02em | `.swish-pay__thanks` L186 (largest live sub-heading) |
| `h5` | `clamp(1.08rem, 1.76vw, 1.72rem)` | 400→700 by context | 1.18 | .025em | `.menu-panel__item h4` L155 |
| `h6` | `1rem` | 700 | 1.2 | .03em | control labels (brush-button/size-option scale L172/L180) |
| `body-lg` | `clamp(1.17rem, 1.59vw, 1.54rem)` | 700 (uppercase emphasis voice) | 1.12 | .03em | `.showcase__copy p` L118 |
| `body` | `clamp(1.05rem, 1.45vw, 1.35rem)` | 400 | 1.22 | .01em | `.section-block__copy p` L162 (absorbs L209's near-identical clamp — see A8) |
| `body-sm` | `.9rem` | 400 | 1.3 | .01em | `.swish-pay__hint` L193 / showcase mobile L271 (most frequent micro size) |
| `caption` | `.86rem` | 700 | 1.2 | .06em | `.footer__bottom` L220 (only live non-hint micro) |

Special non-scale voices preserved: menu display (`--font-menu` 400, `clamp(3.2rem,8vw,7.2rem)` L149); intro lead (`clamp(1.85rem,4.15vw,4.45rem)` 700 L98); `.price` (2rem 700 L169).

### 3.3 Color Palette (normalized)

```css
:root {
  /* Core — already canonical, unchanged */
  --color-bg:        #FEF1DF;  /* cream ground */
  --color-text:      #321E0E;  /* brown ink */
  --color-accent:    #C42026;  /* THE red: accent + menu bg + footer bg */
  --color-on-accent: #FFFFFF;  /* rename of --color-menu-text (used far beyond menus) */

  /* Named one-offs, promoted from literals/aliases */
  --color-surface-merch:   #F388A8;  /* was --color-alt-bg-2 */
  --color-surface-archive: #5D80C0;  /* was raw literal, globals.css:86 */

  /* Derived — normalizes the color-mix sprawl */
  --shadow-ink:      color-mix(in srgb, var(--color-text), transparent 86%); /* absorbs 84/88/90% */
  --ink-muted:       color-mix(in srgb, var(--color-text), transparent 18%); /* absorbs 15/25% */
  --hairline:        color-mix(in srgb, var(--color-text), transparent 80%);
  --img-placeholder: color-mix(in srgb, var(--color-bg), var(--color-on-accent) 28%);
  --scrim:           color-mix(in srgb, #000 48%, transparent);
}
```

| Removed | Replaced with | Why |
|---|---|---|
| `#CB2027` (`--color-alt-text-2`) | `#C42026` (`--color-accent`) | ΔE≈1; one brand red (C1) |
| `#E55EA2` (`--color-pink-text`) | deleted | zero references anywhere |
| `#70CCD6` (`--color-alt-bg-1`) | deleted | only consumer is dead ImageFlow; pairing was ~1.5:1 contrast |
| `#C6D92D` (`--color-alt-text-1`) | deleted | same dead consumer |
| `--color-footer`, `--color-menu-sv`, `--color-menu-en` | `--color-accent` | three aliases of one hex; the CMS hook meant to select them is unwired (C2) |
| raw `#C42026` (L206) | `var(--color-accent)` | self-consistency |
| brown@12% on `.footer__bottom` (L220) | `color-mix(var(--color-on-accent), transparent 12%)` | live bug fix (C3) |
| placeholder bg+white 42% (L128) | `--img-placeholder` (28%) | dead duplicate (C6 color) |
| Tailwind `colors` map | deleted with Tailwind (C8) | no utility classes exist |

**TINA preservation:** no colors live in CMS content; the `background` field values `"swedishMenu"`/`"englishMenu"` in `content/menu-sv.json:4`/`menu-en.json:4` are TINA_BOUND strings and stay untouched.

### 3.4 Layout Rules

```css
:root {
  --max-w-wide:    1180px;  /* MAX_WIDTH_WIDE — from .menu-panel__grid; absorbs 1100/1120 */
  --max-w-content: 760px;   /* MAX_WIDTH_CONTENT — most frequent copy cap (drawer, footer mark) */
  --max-w-display: 860px;   /* second copy tier, intro only (A13 — keep pending judgment) */
  /* MAX_WIDTH_FULL = none: full-bleed section backgrounds; 100vw drawer on mobile */
  --radius-card: 36px;  --radius-media: 24px;  --radius-pill: 999px;
}
```

**Standard section wrapper** (codifies what the live site already does — derived from globals.css L97/L100/L121/L134/L145/L158/L206):

```css
.section          { padding: var(--section-y) var(--section-pad-x);
                    background: var(--section-surface, var(--color-bg)); margin-top: 0; }
.section--compact { padding-block: var(--section-y-compact); }  /* hero, showcase, footer */
.section__inner   { width: min(var(--max-w-wide), 100%); margin-inline: auto; }
.section__copy    { max-width: var(--max-w-content); margin-inline: auto; }
```

**Container alignment rules:** all sections centered, max-width-capped, full-bleed surface color = section boundary; no dividers; the hero nav remains the single left-anchored absolutely-positioned element; mobile gutter unified at 24px (C5).

### 3.5 Component Patterns (canonical)

| Component | Canonical pattern | Derived from |
|---|---|---|
| **Button / primary** | `.brush-button`: filled `--color-accent`, white text, radius 999px, padding `.8rem 1.2rem`, min-height 48px, font 1rem/700, hover `translateY(-3px) rotate(-1deg)` + radius morph, transition 900ms `cubic-bezier(.22,.88,.24,1)` | `globals.css:172-175` (only filled button) |
| **Button / outline-pill** | 2px solid currentColor, radius 999px, padding `.55rem .8rem`, min 48×48px, hover `translateY(-2px)` 160ms ease, `aria-pressed` filled state | `.merch-sizes__option` L180-182 (most complete: hover + pressed + target size) |
| **Button / icon** | circular, 2px solid, size clamp(42px,4.2vw,48px), single font treatment, add hover + visible focus | merged from showcase controls L115 + drawer close L88 (C12) |
| **Card** | radius `--radius-card` (36px), padding `--card-pad`, gap `--sp-micro`, shadow `0 28px 90px var(--shadow-ink)`, inner media radius `--radius-media` | `.merch-card` L163-165 (only live full card; content TINA_BOUND to `products.json`) |
| **SectionWrapper** | `.section` pattern in §3.4 | `.section-block` L158 + the de facto rhythm of all live sections |
| **MediaBlock** | image button: full-bleed img, `--grid-gap` gutters, placeholder `--img-placeholder`, click-to-advance + paired icon buttons; 980ms `cubic-bezier(.16,.84,.24,1)` slide | `ShowcaseSection` (`TehusetHome.tsx:24-103`) + `.showcase__*` L100-118 — already the best-parameterized component |
| **Link** | nav: 700, color transition 180ms ease, hover → `--color-accent` + `translateX(4px)`; on-accent surfaces: white, underline on hover (currently missing — extend nav treatment) | `.hero__nav a` L58-60 (only styled link) |
| **Motion tokens** | `--ease-out-soft: cubic-bezier(.16,1,.3,1)` (drawer), `--ease-slide: cubic-bezier(.16,.84,.24,1)` (rail), `--duration-fast: 180ms`, `--duration-panel: 240ms`, `--duration-slide: 980ms` | the five live transition declarations; extend `prefers-reduced-motion` to cover all (A11 pending) |

---

## 4. Risk Register

### TINA_BOUND risks (cannot rename/restructure freely)

| Risk | Why risky | Safe approach |
|---|---|---|
| **Tina field names ARE JSON keys** — `instagramHandle`, `adminEmail`, `contact.*`, `navigation{key,sv,en,href}`, `hero{title,intro,images}`, `sections.{about,food,restaurant,merch,reservations,instagram,footer}.{eyebrow,title,body}`, `history{eyebrow,title,body,drawerText,images}`, menu `{language,title,background,groups{category,items{name,description,price,image}}}`, `products{id,sku,name,description,priceSek,image,active,sizes}`, photography `{food,restaurant}`, plus locale sub-keys `sv`/`en` everywhere | No Tina client: components index these keys directly (`TehusetHome.tsx:276,381,386,409,419,420,453`; `MenuPanel.tsx`; `MerchCheckout.tsx`; `route.ts`). A rename requires synchronized edits to `tina/config.ts` + regenerated `tina-lock.json` + JSON files + `components/types.ts` + every consumer, in one commit | **Do not rename any schema field or JSON key in Session 2.** Design-system work is CSS/class-level only; class names are all SAFE (bound only to globals.css) |
| **Content file paths** `content/{site,products,menu-sv,menu-en,photography}.json` | Double-bound: Tina globs (`tina/config.ts:27,48,69,77`) AND literal imports (`page.tsx:1-5`, `route.ts:3-4`) | Never move/rename content files |
| **Swish payment chain** | `products[].priceSek` becomes the charge amount (`route.ts:94`); frozen identifiers: route path `/api/swish/payment`, request keys `{productId,size,quantity,customerName,customerEmail,note,lang}`, response keys `{reference,amount,swishNumber,message,summary,qrDataUrl,emailed,confirmation}`, `site.adminEmail`, env `SWISH_NUMBER`/`SMTP_*`/`ORDER_EMAIL_FROM`, product `id` value `"tehuset-shirt"`, 1–10 quantity clamp in both layers | Restyle `MerchCheckout` markup/classes freely; touch nothing in the fetch payload, `OrderResult` key reads, or `route.ts` |
| **Content values acting as code** | `menu.language` (`"sv"`/`"en"`) selects the CSS class (`MenuPanel.tsx:5`) and menu object (`TehusetHome.tsx:219`); `products[].active` selects which product renders; `sizes[0]` is the default selection; section keys in `site.json` are hardcoded property accesses | Keep the `language`-derived class mechanism; collapsing `--color-menu-sv/-en` to one value is safe because both already resolve to `#C42026` and the `background` field never reaches CSS |
| **`menu.background` field** ("swedishMenu"/"englishMenu") — TINA_BOUND, unread | Editor-visible content; deleting JSON values while schema declares them desyncs admin UI | Preserve JSON + schema in Session 2; a future schema change can wire it up or prune it |
| **Tina infrastructure paths** | media root `public/assets` (`tina/config.ts:19`) contains every hardcoded asset path in components; admin SPA builds to `public/admin` | Keep both paths out of any asset restructure; editors can rename files the code references by literal string — don't tighten that coupling further |
| **Section element ids** `top/about/history/food/menu/merch/instagram/contact` | Targeted by hardcoded nav AND by CMS `navigation[].href` values (`site.json:18-37`, incl. the already-dangling `#footer`); the CMS half won't surface in TypeScript | Do not rename ids; fix `#footer`→`#contact` as a content edit (C10) |

### AMBIGUOUS risks (flagged in §2, NOT resolved — do not normalize in Session 2)

A1–A15 above. Highest-stakes: **A6/A7** (verify drawer blue + merch pink against the brand "HEX codes tehuset.txt" on Google Drive before locking the palette), **A10** (missing `<h1>` — needs a content decision), **A15** (red-on-pink contrast failure — needs a value that doesn't exist yet), **A12** (hand-tuned showcase widths — visual QA only).

### STRUCTURAL risks

| Risk | Why risky | Safe approach |
|---|---|---|
| **Order-bearing CMS lists** — `hero.images`, menu `groups`/`items`, `products[].sizes` | Content order = DOM order; Tina drag-to-reorder is a deliberate editorial control; `sizes[0]` is the default selected size | Never re-sort, chunk, or window these arrays in layout code (e.g. no 2-column menu balancing that splits a group) |
| **Optional shapes only partially guarded** | `sections.merch.title![lang]` (`TehusetHome.tsx:419`) crashes if title deleted; `sections.about?.body` unguarded one level deep (`:386`); `sections.food` itself unguarded (`:409`); carousel math divides by `images.length` (NaN on empty array) — safe only while arrays are hardcoded | Fix the `!` and add guards BEFORE any C9 rewiring of `photography.json` into the carousel |
| **Mobile `order` re-sequencing** (`globals.css:244-252`) | DOM order ≠ visual order on mobile; any section wrapper refactor that flattens/renests markup changes either tab order or visual order | Preserve the exact flex-order map when introducing `.section`; verify with keyboard nav |
| **Dual JSON import (client + API route)** | Page and payment route each import `products.json`/`site.json`; server re-validation (`route.ts:65,71-74`) is the safety net | Keep server-side validation untouched; relevant when Tina Cloud lands (per deploy plan) |
| **`menu item.price` empty-string convention** | All prices are `""` today so no price `<span>` renders; a non-empty price adds a right-aligned span to `.menu-panel__line` | Any menu-line restyle must handle both states (`MenuPanel.tsx:16`) |
| **Empty-states exist implicitly** | `MerchCheckout` returns `null` on empty products while the `#merch` heading still renders; all-inactive catalog renders a buyable card that 404s at payment | Don't "fix" these silently during restyling; note for a future product decision |
| **`components/types.ts` is the schema mirror** | Hand-written contract force-cast at `page.tsx:10` | Treat as read-only in Session 2 |

---

## 5. Execution Checklist (Session 2)

Ordered: bug fixes → token consolidation → dead-code removal → component canonicalization → CMS rewiring. All file paths relative to project root. **Items marked ⚠ touch TINA_BOUND surface — follow the stated constraint exactly. Do not touch anything in §2 AMBIGUITIES (A1–A15).**

**Bug fixes (zero design risk)**
1. `styles/globals.css:220` — change `.footer__bottom` color to `color-mix(in srgb, var(--color-on-accent), transparent 12%)` (C3).
2. `styles/globals.css:260` — retarget the no-op `grid-template-columns: 1fr` from `.footer` to `.footer__columns` (or delete; already handled at L239).
3. `components/TehusetHome.tsx:419` — remove the `!` on `sections.merch.title`; add a fallback. `:409` — guard `sections.food` access.
4. ⚠ `content/site.json:23` — content edit: `"#footer"` → `"#contact"` (value-only; do not touch keys).

**Color consolidation (C1, C2)**
5. `styles/globals.css:5-17` — replace palette block with §3.3 token set: rename `--color-menu-text` → `--color-on-accent`; promote `#F388A8` → `--color-surface-merch`, `#5D80C0` → `--color-surface-archive`; delete `--color-pink-text`, `--color-alt-bg-1`, `--color-alt-text-1`, `--color-alt-text-2`, `--color-footer`, `--color-menu-sv`, `--color-menu-en`. Update all `var()` references (L146-147 menu rules both point at `--color-accent`; keep the `--sv/--en` class selectors themselves — ⚠ class derivation from `menu.language` stays).
6. `styles/globals.css:159-160` — replace `var(--color-alt-text-2)` with `var(--color-accent)`; `:206` — replace raw `#C42026` with `var(--color-accent)`; `:86` — replace raw `#5D80C0` with `var(--color-surface-archive)`.
7. Add derived tokens `--shadow-ink`, `--ink-muted`, `--hairline`, `--img-placeholder`, `--scrim` (§3.3) and swap the 17 `color-mix()` call sites onto them (L51, L78, L84, L86, L143→delete, L163, L189, L190, L192, L193, L220).

**Spacing consolidation (C5, C6)**
8. `styles/globals.css:42` — `--mobile-pad-x: 18px` → `24px`.
9. Remap and delete `--space-5..9`: L200 → `var(--sp-micro)`; L232 → `var(--sp-standard)`; L283 → `var(--sp-standard) var(--mobile-pad-x)` for the 48px parts, leave the 64px top value as a literal pending A3. Delete `--space-5` through `--space-9` definitions (L24-28). Delete `--copy-gap` and replace its 5 uses with `var(--sp-micro)`.

**Dead code removal (zero visual impact — verify with a build + visual diff)**
10. Delete `components/ImageFlow.tsx`; remove `photos` import only if step 18 is NOT taken (otherwise it gets used).
11. `styles/globals.css` — delete `.image-flow*` (L121-132), `@keyframes railDrift` (L126), `@keyframes floatCurl` (L223), `.history-archive*` (L134-143), `.section-block--blue` (L195-198), `.language-toggle--light` (L54-55), and their media-query partials (L239, L240, L278-279). ⚠ Leave `site.history.images` and all schema fields untouched.
12. `components/LanguageToggle.tsx` — drop the unused `tone` prop (or wire it; default: drop).
13. `components/TehusetHome.tsx:360` — remove the `monte-hero` class (no CSS exists). Remove unused `ui.shopEyebrow`/`ui.instagramEyebrow` (`:236-237`, `:263-264`).
14. Remove Tailwind (C8): delete `tailwind.config.js`, `postcss.config.js` Tailwind wiring, and the `tailwindcss` dependency in `package.json`. (Keep PostCSS itself if anything else uses it — check before deleting the config.)
15. Move `content/reference-catalog.json` out of `content/` (e.g. `docs/`) — ⚠ verify it matches no Tina glob first (it doesn't: globs are `site`, `menu-*`, `products`, `photography`).

**Component canonicalization**
16. Add motion tokens (`--ease-out-soft`, `--ease-slide`, `--duration-fast/panel/slide` per §3.5) and swap the five live transition declarations (L59, L84, L86, L112, L172, L180) onto them. Keep `slideDurationMs = 980` in `TehusetHome.tsx:32` in sync with `--duration-slide`.
17. Merge the two circular icon buttons (C12): shared `.icon-button` base — size `clamp(42px, 4.2vw, 48px)`, 2px border, weight 700 — applied to `.showcase__controls button` and `.history-drawer__close`. Add a hover state consistent with `.merch-sizes__option` (translateY(-2px), 160ms) and a `:focus-visible` outline (2px, `currentColor`, offset 2px) to ALL interactive elements site-wide (currently zero focus styles).
18. ⚠ Rewire showcase content (C9): pass `photos.food`/`photos.restaurant` from `app/page.tsx` into the two `ShowcaseSection`s with the hardcoded arrays as fallback AND an empty-array guard in the carousel math (`TehusetHome.tsx:33-103`) — guard FIRST (item 3 pattern), then rewire. Same for text: `site.sections.{restaurant,food}.body[lang] ?? ui.historyCopy/foodCopy`.
19. ⚠ Rewire nav (C10): render `.hero__nav` from `site.navigation` mapped by `key` (the `history` item keeps its drawer `onClick`); depends on item 4. Fallback to current hardcoded labels if the array is empty.
20. Consolidate eyebrow (C11): single `.eyebrow` class (accent color, ls .12em); `.history-drawer__eyebrow` keeps only its margin override; ⚠ bind drawer eyebrow text to `site.history.eyebrow[lang]` with the current string as fallback.
21. Introduce the `.section`/`.section__inner`/`.section__copy` wrapper (§3.4) — apply to the merch/instagram blocks first (lowest risk), then hero/showcase/footer, preserving the exact mobile `order` map (`globals.css:244-252`) and all section `id`s. Standardize wide caps to `--max-w-wide: 1180px` (footer columns 1120→1180, hero strip cap 1100→1180 keeping `86vw` guard) — visual QA each.

**Verification gate for every item:** `npm run build` passes; visual diff of all 8 live sections at 360px/768px/1280px; keyboard-tab through nav, carousel, drawer, and checkout; one test checkout against the Swish flow after any `MerchCheckout` change (route and payload must be byte-identical).

---
*End of audit. No source files were modified. Generated by three parallel audit passes (frontend, UI/UX, backend/CMS) on 2026-06-12.*
