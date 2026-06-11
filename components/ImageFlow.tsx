import type { Localized, Lang } from './types';

export function ImageFlow({ id, eyebrow, title, body, images, lang, variant }: { id: string; eyebrow: Localized; title: Localized; body: Localized; images: string[]; lang: Lang; variant: 'food' | 'restaurant' }) {
  return (
    <section id={id} className={`image-flow image-flow--${variant}`}>
      <div className="image-flow__copy">
        <p className="eyebrow">{eyebrow[lang]}</p>
        <h2>{title[lang]}</h2>
        <p>{body[lang]}</p>
      </div>
      <div className="image-flow__rail" aria-label={title[lang]}>
        {images.map((src, index) => (
          <figure className="image-flow__card" key={src} style={{ ['--delay' as string]: `${index * 120}ms` }}>
            <img src={src} alt="Tehuset" loading="lazy" />
            <figcaption>{variant === 'food' ? 'TEHUSET FOOD' : 'TEHUSET TERRACE'}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
