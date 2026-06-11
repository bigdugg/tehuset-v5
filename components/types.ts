export type Lang = 'sv' | 'en';
export type Localized = { sv: string; en: string };

export type SiteContent = {
  instagramHandle: string;
  adminEmail: string;
  contact: { email: string; phone?: string; address: Localized; socials: { label: string; url: string }[] };
  navigation: { key: string; sv: string; en: string; href: string }[];
  hero: { title: Localized; intro: Localized; images: string[] };
  sections: Record<string, { title?: Localized; eyebrow?: Localized; body: Localized }>;
  history?: { eyebrow: Localized; title: Localized; body: Localized; drawerText?: Localized; images: { src: string; caption: Localized; credit: string }[] };
};

export type MenuContent = {
  language: Lang;
  title: string;
  background: 'swedishMenu' | 'englishMenu';
  groups: { category: string; items: { name: string; description: string; price?: string; image?: string }[] }[];
};

export type Product = {
  id: string;
  sku: string;
  name: Localized;
  description: Localized;
  priceSek: number;
  image: string;
  active: boolean;
  sizes?: string[];
};
