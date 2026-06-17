# Tehuset — Codebase Audit

> Read-only audit. No changes were made. Date: 2026-06-17.

---

## 1. Next.js version and router

**Next.js 15.0.0**, React 19.0.0.

Uses the **App Router** — an `app/` directory exists containing `layout.tsx`, `page.tsx`, and an `api/` subfolder. No `pages/` directory exists.

---

## 2. `lang` — where it lives and how it moves

`lang` is a **React `useState` hook**, defined at the top of `TehusetHome` in `components/TehusetHome.tsx`:

```ts
// TehusetHome.tsx:231
const [lang, setLang] = useState<Lang>('en');
```

**Default is `'en'`** (English). It is passed **down as a prop** to every child that needs it. There is no context, store, or URL param — the value lives entirely in `TehusetHome`.

| Child component | How it receives `lang` |
|---|---|
| `LanguageToggle` | `lang` + `setLang` props — renders the toggle, triggers changes |
| `MerchCheckout` | `lang` prop — used for product name, description, and order API call |
| `HistoryDrawer` | `lang` prop — used for gallery image captions |
| `MenuPanel` | Does **not** receive `lang` — receives the already-resolved `menu` object: `const menu = lang === 'sv' ? menuSv : menuEn` |

`Lang` is typed as `'sv' | 'en'` in `components/types.ts`.

---

## 3. Localized content pattern

All localized fields are `{ sv: string; en: string }` objects, typed as `Localized` in `components/types.ts`. They are read by subscripting with `[lang]`.

**Two patterns are in use — they are functionally identical but inconsistent in style:**

### Pattern A — subscript access (used everywhere CMS content is read)

```ts
// Direct access (field guaranteed present):
site.sections.about?.body[lang]

// Optional chaining (field may be absent from JSON):
site.sections.restaurant?.eyebrow?.[lang]
site.sections.restaurant?.title?.[lang]
```

### Pattern B — explicit ternary (used in nav items and MerchCheckout)

```ts
// TehusetHome.tsx — nav items from site.navigation[]:
lang === 'sv' ? item.sv : item.en

// MerchCheckout.tsx — ad-hoc helper:
const tr = (sv: string, en: string) => (lang === 'sv' ? sv : en);
```

Pattern A (`object[lang]`) is the house style for CMS-sourced content. Pattern B appears where the object shape is `{ sv, en }` but not typed as `Localized`, or inside `MerchCheckout` which predates the `Localized` type convention.

---

## 4. `content/photography.json` structure

The arrays contain **plain strings (image paths only)**. No captions, no alt text, no localized fields.

```json
{
  "food": [
    "/assets/photography/food1.jpeg",
    "/assets/photography/food2.jpeg",
    "/assets/photography/food3.jpeg",
    "/assets/photography/food4.jpeg"
  ],
  "restaurant": [
    "/assets/photography/restaurant-3.jpeg",
    "/assets/photography/restaurant-4.jpeg",
    "/assets/photography/restaurant-5.jpeg",
    "/assets/photography/restaurant-6.jpeg",
    "/assets/photography/restaurant-7.jpeg",
    "/assets/photography/restaurant-8.jpeg"
  ]
}
```

This differs from `history.images[]` in `site.json`, which uses an object array with `{ src, caption: { sv, en }, credit }`. Photography has no equivalent metadata schema.

---

## 5. Schema mismatches — `tina/config.ts` vs `content/site.json`

### In the config but missing from JSON

| Field | Config defines | JSON has |
|---|---|---|
| `sections.reservations` | Full section (eyebrow, title, body) | **Absent entirely** — not in `site.json` at all |
| `sections.about.eyebrow` | Defined | Missing — JSON only has `title` + `body` |
| `sections.merch.eyebrow` | Defined | Missing — JSON only has `title` + `body` |
| `sections.instagram.eyebrow` | Defined | Missing — JSON only has `title` + `body` |
| `sections.footer.eyebrow` | Defined | Missing — JSON only has `body` |
| `sections.footer.title` | Defined | Missing — JSON only has `body` |

**Root cause:** the sections schema is generated with a `.map()` that gives every section an identical `[eyebrow, title, body]` triple, but the JSON was written by hand and only populated the fields actually needed per section. `reservations` was never populated at all.

### In JSON but missing from config

None. All JSON top-level keys (`instagramHandle`, `adminEmail`, `contact`, `hours`, `illustrations`, `navigation`, `hero`, `sections`, `history`) have corresponding fields in `tina/config.ts`.
