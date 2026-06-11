// tina/config.ts
import { defineConfig } from "tinacms";
var localizedText = (label, name, ui = "input") => ({
  type: "object",
  label,
  name,
  fields: [
    { type: "string", label: "Swedish", name: "sv", ui: { component: ui } },
    { type: "string", label: "English", name: "en", ui: { component: ui } }
  ]
});
var config_default = defineConfig({
  branch: process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || null,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || null,
  token: process.env.TINA_TOKEN || null,
  build: { outputFolder: "admin", publicFolder: "public" },
  media: { tina: { mediaRoot: "assets", publicFolder: "public" } },
  schema: {
    collections: [
      {
        name: "site",
        label: "Site content",
        path: "content",
        format: "json",
        match: { include: "site" },
        fields: [
          { type: "string", name: "instagramHandle", label: "Instagram handle" },
          { type: "string", name: "adminEmail", label: "Admin email for order confirmations" },
          { type: "object", name: "contact", label: "Contact", fields: [
            { type: "string", name: "email", label: "Email" },
            { type: "string", name: "phone", label: "Phone" },
            localizedText("Address", "address"),
            { type: "object", name: "socials", label: "Social links", list: true, fields: [{ type: "string", name: "label", label: "Label" }, { type: "string", name: "url", label: "URL" }] }
          ] },
          { type: "object", name: "navigation", label: "Navigation", list: true, fields: [{ type: "string", name: "key", label: "Key" }, { type: "string", name: "sv", label: "Swedish label" }, { type: "string", name: "en", label: "English label" }, { type: "string", name: "href", label: "Anchor/link" }] },
          { type: "object", name: "hero", label: "Hero", fields: [localizedText("Title", "title"), localizedText("Intro", "intro", "textarea"), { type: "image", name: "images", label: "Hero images", list: true }] },
          { type: "object", name: "sections", label: "Sections", fields: ["about", "food", "restaurant", "merch", "reservations", "instagram", "footer"].map((name) => ({ type: "object", name, label: name, fields: [localizedText("Eyebrow", "eyebrow"), localizedText("Title", "title"), localizedText("Body", "body", "textarea")] })) },
          { type: "object", name: "history", label: "History archive", fields: [localizedText("Eyebrow", "eyebrow"), localizedText("Title", "title"), localizedText("Body", "body", "textarea"), localizedText("Drawer text", "drawerText", "textarea"), { type: "object", name: "images", label: "Archive images", list: true, fields: [{ type: "image", name: "src", label: "Image" }, localizedText("Caption", "caption"), { type: "string", name: "credit", label: "Credit" }] }] }
        ]
      },
      {
        name: "menus",
        label: "Menus",
        path: "content",
        format: "json",
        match: { include: "menu-*" },
        fields: [
          { type: "string", name: "language", label: "Language" },
          { type: "string", name: "title", label: "Title" },
          { type: "string", name: "background", label: "Background token" },
          { type: "object", name: "groups", label: "Menu groups", list: true, fields: [
            { type: "string", name: "category", label: "Category" },
            { type: "object", name: "items", label: "Items", list: true, fields: [
              { type: "string", name: "name", label: "Name" },
              { type: "string", name: "description", label: "Description", ui: { component: "textarea" } },
              { type: "string", name: "price", label: "Price" },
              { type: "image", name: "image", label: "Image" }
            ] }
          ] }
        ]
      },
      {
        name: "products",
        label: "Merch products",
        path: "content",
        format: "json",
        match: { include: "products" },
        fields: [{ type: "object", name: "products", label: "Products", list: true, fields: [{ type: "string", name: "id", label: "ID" }, { type: "string", name: "sku", label: "SKU" }, localizedText("Name", "name"), localizedText("Description", "description", "textarea"), { type: "number", name: "priceSek", label: "Price SEK" }, { type: "image", name: "image", label: "Image" }, { type: "boolean", name: "active", label: "Active" }] }]
      },
      {
        name: "photography",
        label: "Photography",
        path: "content",
        format: "json",
        match: { include: "photography" },
        fields: [
          { type: "image", name: "food", label: "Food photos", list: true },
          { type: "image", name: "restaurant", label: "Restaurant photos", list: true }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
