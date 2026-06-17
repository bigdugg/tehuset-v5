 'use client';
import type { Lang } from './types';

export function LanguageToggle({ lang, setLang }: { lang: Lang; setLang: (lang: Lang) => void }) {
  const labels: Record<Lang, Record<Lang, string>> = {
    sv: { sv: 'Svenska', en: 'Byt till engelska' },
    en: { sv: 'Switch to Swedish', en: 'English' },
  };

  return (
    <div className="language-toggle" aria-label={lang === 'sv' ? 'Språkväljare' : 'Language selector'}>
      {(['sv', 'en'] as Lang[]).map((code) => (
        <button key={code} type="button" aria-label={labels[lang][code]} aria-pressed={lang === code} onClick={() => setLang(code)}>
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
