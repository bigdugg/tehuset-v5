 'use client';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import type { Lang, MenuContent, Product, SiteContent } from './types';
import { LanguageToggle } from './LanguageToggle';
import { MenuPanel } from './MenuPanel';
import { MerchCheckout } from './MerchCheckout';
import photographyData from '../content/photography.json';

// PATCH 1: Image arrays from photography.json
const restaurantShowcaseImages: string[] = photographyData.restaurant;
const foodShowcaseImages: string[] = photographyData.food;

// PATCH 5: eyebrow + title props added
function ShowcaseSection({ id, images, imageSide, illustration, illustrationAlt, eyebrow, title, text, imageLabel, controlsLabel, previousImageLabel, nextImageLabel }: { id: string; images: string[]; imageSide: 'left' | 'right'; illustration: string; illustrationAlt: string; eyebrow?: string; title?: string; text: string; imageLabel: string; controlsLabel: string; previousImageLabel: string; nextImageLabel: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [trackOffsets, setTrackOffsets] = useState([0, 1, 2]);
  const [railShiftPx, setRailShiftPx] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const railRef = useRef<HTMLSpanElement | null>(null);
  const slideTimer = useRef<number | null>(null);
  const isSlidingRef = useRef(false);
  const slideDurationMs = 980; // mirrors --duration-slide in styles/globals.css
  const wrapIndex = (index: number) => (index + images.length) % images.length;
  const trackImages = trackOffsets.map((offset) => images[wrapIndex(activeIndex + offset)]);
  const measureSlideDistance = () => {
    const rail = railRef.current;
    const railImages = Array.from(rail?.querySelectorAll('img') ?? []);
    if (!rail || railImages.length === 0) return 0;

    const imageRects = railImages.map((image) => image.getBoundingClientRect());
    for (let index = 0; index < imageRects.length - 1; index += 1) {
      const current = imageRects[index];
      const next = imageRects[index + 1];
      if (current.width > 20 && next.width > 20) {
        return Math.abs(next.left - current.left);
      }
    }

    const firstVisibleImage = imageRects.find((rect) => rect.width > 20);
    const gap = Number.parseFloat(window.getComputedStyle(rail).columnGap || '0');
    return firstVisibleImage ? firstVisibleImage.width + gap : 0;
  };

  useEffect(() => {
    images.forEach((src) => {
      const image = new Image();
      image.src = src;
      image.decode?.().catch(() => undefined);
    });

    return () => {
      if (slideTimer.current) window.clearTimeout(slideTimer.current);
    };
  }, [images]);

  const finishSlide = (direction: 'next' | 'previous') => {
    setActiveIndex((current) => wrapIndex(current + (direction === 'next' ? 1 : -1)));
    setIsSliding(false);
    isSlidingRef.current = false;
    setTrackOffsets([0, 1, 2]);
    setRailShiftPx(0);
    slideTimer.current = null;
  };

  const startSlide = (direction: 'next' | 'previous') => {
    if (isSlidingRef.current) return;
    isSlidingRef.current = true;
    const isNext = direction === 'next';
    setTrackOffsets(isNext ? [0, 1, 2, 3] : [-1, 0, 1, 2]);
    setIsSliding(false);
    setRailShiftPx(0);

    window.requestAnimationFrame(() => {
      const distance = measureSlideDistance();
      if (!distance) {
        finishSlide(direction);
        return;
      }

      const initialShift = isNext ? 0 : -distance;
      const targetShift = isNext ? -distance : 0;

      setRailShiftPx(initialShift);

      window.requestAnimationFrame(() => {
        setIsSliding(true);
        setRailShiftPx(targetShift);
        slideTimer.current = window.setTimeout(() => {
          finishSlide(direction);
        }, slideDurationMs);
      });
    });
  };

  const showNext = () => startSlide('next');
  const showPrevious = () => startSlide('previous');

  return (
    <section id={id} className={`showcase showcase--images-${imageSide} section section--compact`}>
      <div className="showcase__deck" aria-label={imageLabel}>
        <div className="showcase__preload" aria-hidden="true">
          {images.map((src) => <img key={src} src={src} alt="" loading="eager" />)}
        </div>
        <button className="showcase__image-button" type="button" onClick={showNext} aria-label={nextImageLabel}>
          <span ref={railRef} className={`showcase__rail${isSliding ? ' showcase__rail--moving' : ''}`} style={{ transform: `translate3d(${railShiftPx}px, 0, 0)` }}>
            {trackImages.map((src, index) => (
              <img key={index} src={src} alt="Tehuset" loading="eager" />
            ))}
          </span>
        </button>
        <div className="showcase__controls" aria-label={controlsLabel}>
          <button className="icon-button" type="button" onClick={showPrevious} aria-label={previousImageLabel}>←</button>
          <button className="icon-button" type="button" onClick={showNext} aria-label={nextImageLabel}>→</button>
        </div>
      </div>
      <div className="showcase__copy">
        <img className="showcase__graphic" src={illustration} alt={illustrationAlt} loading="lazy" />
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        {title && <h2>{title}</h2>}
        <p>{text}</p>
      </div>
    </section>
  );
}

type WeatherKind = 'sun' | 'cloud' | 'rain' | 'snow' | 'storm' | 'fog';

function weatherKindForCode(code: number): WeatherKind {
  if ([0, 1].includes(code)) return 'sun';
  if ([2, 3].includes(code)) return 'cloud';
  if ([45, 48].includes(code)) return 'fog';
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return 'rain';
  if ([71, 73, 75].includes(code)) return 'snow';
  if ([95].includes(code)) return 'storm';
  return 'cloud';
}

function WeatherGraphic({ kind }: { kind: WeatherKind }) {
  return <span className={`weather-graphic weather-graphic--${kind}`} aria-hidden="true" />;
}

function HistoryBlueprint() {
  return (
    <svg className="history-drawer__blueprint" viewBox="0 0 640 360" role="img" aria-label="Blueprint line art of Tehuset by Kungsträdgården">
      <path d="M78 272 C138 220 175 170 210 92" />
      <path d="M564 86 C487 132 418 176 360 250" />
      <path d="M116 284 C206 230 301 208 414 222 C470 229 520 246 566 280" />
      <path d="M143 92 H500 V248 H143 Z" />
      <path d="M182 122 H462 V215 H182 Z" />
      <path d="M214 151 H278 V215" />
      <path d="M318 122 V215" />
      <path d="M360 151 H430 V215" />
      <path d="M124 248 H520" />
      <circle cx="244" cy="88" r="26" />
      <circle cx="424" cy="88" r="24" />
      <circle cx="98" cy="262" r="18" />
      <circle cx="548" cy="270" r="18" />
      <path d="M296 272 H344" />
      <path d="M320 248 V296" />
      <path d="M293 295 H347" />
      <path d="M68 318 H576" />
      <path d="M84 318 V332 M140 318 V332 M196 318 V332 M252 318 V332 M308 318 V332 M364 318 V332 M420 318 V332 M476 318 V332 M532 318 V332" />
    </svg>
  );
}

// PATCH 9: History archive image gallery
function HistoryGallery({ images, lang }: { images: { src: string; caption?: { sv: string; en: string }; credit?: string }[]; lang: Lang }) {
  return (
    <div className="history-gallery">
      {images.map((img, i) => (
        <figure key={i}>
          <img src={img.src} alt={img.caption?.[lang] ?? ''} />
          <figcaption>
            {img.caption?.[lang] && <span>{img.caption[lang]}</span>}
            {img.credit && <cite>{img.credit}</cite>}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

// PATCH 8: eyebrow from CMS + PATCH 9: gallery inside drawer
function HistoryDrawer({ open, onClose, eyebrow, title, text, closeLabel, lang, images }: { open: boolean; onClose: () => void; eyebrow: string; title: string; text: string; closeLabel: string; lang: Lang; images?: { src: string; caption?: { sv: string; en: string }; credit?: string }[] }) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <div className={`history-drawer${open ? ' history-drawer--open' : ''}`} aria-hidden={!open}>
      <button className="history-drawer__backdrop" type="button" onClick={onClose} aria-label={closeLabel} tabIndex={open ? 0 : -1} />
      <aside id="history-drawer" className="history-drawer__panel" role="dialog" aria-modal={open} aria-labelledby="history-drawer-title" aria-describedby="history-drawer-text">
        <button ref={closeButtonRef} className="history-drawer__close icon-button" type="button" onClick={onClose} aria-label={closeLabel} tabIndex={open ? 0 : -1}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <line x1="1" y1="1" x2="13" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="13" y1="1" x2="1" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <div className="history-drawer__art" aria-hidden="true">
          <HistoryBlueprint />
        </div>
        <div className="history-drawer__copy">
          <p className="eyebrow history-drawer__eyebrow">{eyebrow}</p>
          <h2 id="history-drawer-title">{title}</h2>
          <p id="history-drawer-text">{text}</p>
          {images && images.length > 0 && <HistoryGallery images={images} lang={lang} />}
        </div>
      </aside>
    </div>
  );
}

export function TehusetHome({ site, menuSv, menuEn, products }: { site: SiteContent; menuSv: MenuContent; menuEn: MenuContent; products: Product[] }) {
  const [lang, setLang] = useState<Lang>('en');
  const [weather, setWeather] = useState('weather loading');
  const [weatherKind, setWeatherKind] = useState<WeatherKind>('cloud');
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const menu = lang === 'sv' ? menuSv : menuEn;

  // PATCH 2: restaurant copy from CMS
  const historyCopy = site.sections.restaurant?.body?.[lang] ?? '';
  // PATCH 3: food copy + title from CMS
  const foodCopy = site.sections.food?.body?.[lang] ?? '';
  // PATCH 8: drawer text (drawerText preferred, falls back to history.body)
  const historyDrawerText = site.history?.drawerText?.[lang] ?? site.history?.body?.[lang] ?? '';

  const ui = {
    sv: {
      primaryNav: 'Primär navigering',
      contact: 'Kontakt',
      heroImages: 'Tehuset-bilder',
      heroStatusPrefix: 'Öppet från 10 - sent',
      showcaseImages: 'Bildspel',
      imageControls: 'Bildkontroller',
      previousImage: 'Visa föregående bild',
      nextImage: 'Visa nästa bild',
      elmsAlt: 'Almgrafik',
      castleAlt: 'Slottsgrafik',
      openingHours: 'Öppettider',
      findUs: 'Hitta hit',
      mapLink: 'Jag behöver en riktig karta →',
      siteBy: 'Sida av Cadree',
      weatherFallback: 'aktuellt väder',
      weatherLoading: 'väder hämtas',
      historyDrawerClose: 'Stäng historia',
    },
    en: {
      primaryNav: 'Primary navigation',
      contact: 'Contact',
      heroImages: 'Tehuset hero images',
      heroStatusPrefix: 'Open from 10 - late',
      showcaseImages: 'Image carousel',
      imageControls: 'Image controls',
      previousImage: 'Show previous image',
      nextImage: 'Show next image',
      elmsAlt: 'Elms graphic',
      castleAlt: 'Castle graphic',
      openingHours: 'Opening Hours',
      findUs: 'Find Us',
      mapLink: 'I need a real map →',
      siteBy: 'Site by Cadree',
      weatherFallback: 'current weather',
      weatherLoading: 'weather loading',
      historyDrawerClose: 'Close history',
    },
  }[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    const weatherLabels: Record<Lang, Record<number, string>> = {
      sv: {
        0: 'klart',
        1: 'mestadels klart',
        2: 'halvklart',
        3: 'mulet',
        45: 'dimma',
        48: 'dimma',
        51: 'duggregn',
        53: 'duggregn',
        55: 'duggregn',
        61: 'regn',
        63: 'regn',
        65: 'regn',
        71: 'snö',
        73: 'snö',
        75: 'snö',
        80: 'regnskurar',
        81: 'regnskurar',
        82: 'regnskurar',
        95: 'åska',
      },
      en: {
        0: 'clear',
        1: 'mostly clear',
        2: 'partly cloudy',
        3: 'overcast',
        45: 'fog',
        48: 'fog',
        51: 'drizzle',
        53: 'drizzle',
        55: 'drizzle',
        61: 'rain',
        63: 'rain',
        65: 'rain',
        71: 'snow',
        73: 'snow',
        75: 'snow',
        80: 'rain showers',
        81: 'rain showers',
        82: 'rain showers',
        95: 'thunderstorm',
      },
    };

    let cancelled = false;
    setWeather(ui.weatherLoading);

    fetch('https://api.open-meteo.com/v1/forecast?latitude=59.3293&longitude=18.0686&current=temperature_2m,weather_code&timezone=Europe%2FStockholm')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('weather unavailable')))
      .then((data) => {
        if (cancelled) return;
        const temperature = Math.round(data?.current?.temperature_2m);
        const code = Number(data?.current?.weather_code);
        const label = weatherLabels[lang][code] ?? ui.weatherFallback;
        setWeatherKind(Number.isFinite(code) ? weatherKindForCode(code) : 'cloud');
        setWeather(Number.isFinite(temperature) ? `${temperature}°C, ${label}` : label);
      })
      .catch(() => {
        if (!cancelled) {
          setWeatherKind('cloud');
          setWeather(ui.weatherFallback);
        }
      });

    return () => { cancelled = true; };
  }, [lang, ui.weatherFallback, ui.weatherLoading]);

  const openHistoryDrawer = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setIsHistoryDrawerOpen(true);
  };

  const closeHistoryDrawer = () => setIsHistoryDrawerOpen(false);

  return (
    <main>
      <section className="hero section section--compact" id="top">
        {/* PATCH 4: nav driven by site.navigation */}
        <nav className="hero__nav" aria-label={ui.primaryNav}>
          {site.navigation.map((item) =>
            item.key === 'history' ? (
              <a key={item.key} href={item.href} onClick={openHistoryDrawer} aria-controls="history-drawer" aria-expanded={isHistoryDrawerOpen} aria-haspopup="dialog">
                {lang === 'sv' ? item.sv : item.en}
              </a>
            ) : (
              <a key={item.key} href={item.href}>
                {lang === 'sv' ? item.sv : item.en}
              </a>
            )
          )}
        </nav>
        <HistoryDrawer
          open={isHistoryDrawerOpen}
          onClose={closeHistoryDrawer}
          eyebrow={site.history?.eyebrow?.[lang] ?? ''}
          title={site.history?.title?.[lang] ?? ''}
          text={historyDrawerText}
          closeLabel={ui.historyDrawerClose}
          lang={lang}
          images={site.history?.images}
        />
        <div className="hero__language">
          <LanguageToggle lang={lang} setLang={setLang} />
        </div>
        <div className="hero__logo-wrap">
          <img className="hero__logo" src="/assets/brand/tehuset-logo-red.png" alt="Tehuset" />
          {/* PATCH 13: hero title from CMS */}
          {site.hero.title?.[lang] && <h1 className="hero-title">{site.hero.title[lang]}</h1>}
          <p className="hero__status">
            <span>{ui.heroStatusPrefix}</span>
            <span className="hero__status-separator" aria-hidden="true">•</span>
            <span className="hero__weather"><WeatherGraphic kind={weatherKind} /> {weather}</span>
            <span className="hero__status-separator" aria-hidden="true">•</span>
            <span>Stockholm</span>
          </p>
        </div>
        <div className="hero__image-strip" aria-label={ui.heroImages}>
          {site.hero.images.map((src) => <img key={src} src={src} alt="Tehuset" />)}
        </div>
      </section>

      <section className="intro-copy" id="about">
        <p>{site.sections.about?.body[lang] ?? site.hero.intro[lang]}</p>
      </section>

      {/* PATCHES 2, 5, 12: restaurant showcase with CMS copy, eyebrow/title, illustration */}
      <ShowcaseSection
        id="history"
        images={restaurantShowcaseImages}
        imageSide="right"
        illustration={site.illustrations?.elms ?? '/assets/illustrations/elms-graphic2.png'}
        illustrationAlt={ui.elmsAlt}
        eyebrow={site.sections.restaurant?.eyebrow?.[lang]}
        title={site.sections.restaurant?.title?.[lang]}
        text={historyCopy}
        imageLabel={`${site.sections.restaurant?.eyebrow?.[lang] ?? ''} ${ui.showcaseImages}`}
        controlsLabel={ui.imageControls}
        previousImageLabel={ui.previousImage}
        nextImageLabel={ui.nextImage}
      />

      {/* PATCHES 3, 5, 12: food showcase with CMS copy, eyebrow/title, illustration */}
      <ShowcaseSection
        id="food"
        images={foodShowcaseImages}
        imageSide="left"
        illustration={site.illustrations?.castle ?? '/assets/illustrations/castle-graphic2.png'}
        illustrationAlt={ui.castleAlt}
        eyebrow={site.sections.food?.eyebrow?.[lang]}
        title={site.sections.food?.title?.[lang]}
        text={foodCopy}
        imageLabel={`${site.sections.food?.eyebrow?.[lang] ?? ui.showcaseImages} ${ui.showcaseImages}`}
        controlsLabel={ui.imageControls}
        previousImageLabel={ui.previousImage}
        nextImageLabel={ui.nextImage}
      />

      <MenuPanel menu={menu} />

      <section id="merch" className="section section-block section-block--pink">
        <div className="section-block__copy">
          <h2>{site.sections.merch.title?.[lang] ?? ''}</h2>
          <p>{site.sections.merch.body[lang]}</p>
        </div>
        <MerchCheckout lang={lang} products={products} />
      </section>

      {/* PATCH 10: instagram section with CMS title + body */}
      <section id="instagram" className="section section-block instagram-block">
        {(site.sections.instagram?.title?.[lang] || site.sections.instagram?.body?.[lang]) && (
          <div className="section-block__copy">
            {site.sections.instagram?.title?.[lang] && <h2>{site.sections.instagram.title[lang]}</h2>}
            {site.sections.instagram?.body?.[lang] && <p>{site.sections.instagram.body[lang]}</p>}
          </div>
        )}
        <a className="instagram-lockup" href="https://www.instagram.com/tehuset/" aria-label="Tehuset Instagram" target="_blank" rel="noreferrer">
          <span className="footer__instagram instagram-lockup__mark" aria-hidden="true" />
          <span className="instagram-lockup__text">tehuset</span>
        </a>
        <iframe title="Tehuset Instagram" src={`https://www.instagram.com/${site.instagramHandle}/embed`} loading="lazy" />
      </section>

      <footer id="contact" className="footer section section--compact">
        {/* PATCH 10: footer section body from CMS */}
        {site.sections.footer?.body?.[lang] && (
          <p className="footer__tagline">{site.sections.footer.body[lang]}</p>
        )}
        <div className="footer__columns">
          <section className="footer__column" aria-labelledby="footer-contact-title">
            <h2 id="footer-contact-title">{ui.contact}</h2>
            <div className="footer__contact">
              <a href={`mailto:${site.contact.email}`}>{site.contact.email.toUpperCase()}</a>
              {/* PATCH 11: socials from CMS */}
              {site.contact.socials.map((s) => (
                <a
                  key={s.label}
                  className={s.label === 'Instagram' ? 'footer__instagram' : undefined}
                  href={s.url}
                  aria-label={`Tehuset ${s.label}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {s.label !== 'Instagram' && s.label}
                </a>
              ))}
            </div>
          </section>

          <section className="footer__column" aria-labelledby="footer-hours-title">
            <h2 id="footer-hours-title">{ui.openingHours}</h2>
            {/* PATCH 7: hours from CMS */}
            <div className="footer__hours">
              <p>{site.hours?.label?.[lang]}</p>
              <p>{site.hours?.time}</p>
            </div>
          </section>

          <section className="footer__column" aria-labelledby="footer-find-title">
            <h2 id="footer-find-title">{ui.findUs}</h2>
            <address>{site.contact.address[lang]}</address>
            {/* PATCH 6: maps URL from CMS */}
            <a className="footer__map-link" href={site.contact.mapsUrl} target="_blank" rel="noreferrer">
              {ui.mapLink}
            </a>
          </section>
        </div>

        {/* PATCH 12: footer illustration from CMS */}
        <div className="footer__mark" aria-hidden="true">
          <img src={site.illustrations?.footer ?? '/assets/illustrations/strommen-graphic2-white.png'} alt="" />
        </div>

        <div className="footer__bottom">
          <p>© 2026 Tehuset.</p>
          <p>{ui.siteBy}</p>
        </div>
      </footer>
    </main>
  );
}
