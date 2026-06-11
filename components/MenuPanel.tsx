import type { MenuContent } from './types';

export function MenuPanel({ menu }: { menu: MenuContent }) {
  return (
    <section id="menu" className={`menu-panel ${menu.language === 'sv' ? 'menu-panel--sv' : 'menu-panel--en'}`}>
      <img className="menu-panel__logo" src="/assets/brand/tehuset-logo-white.png" alt="Tehuset" />
      <h2>{menu.title}</h2>
      <div className="menu-panel__grid">
        {menu.groups.map((group) => (
          <article key={group.category} className="menu-panel__group">
            <h3>{group.category}</h3>
            {group.items.map((item) => (
              <div className="menu-panel__item" key={`${group.category}-${item.name}`}>
                <div className="menu-panel__line">
                  <h4>{item.name}</h4>
                  {item.price ? <span>{item.price}</span> : null}
                </div>
                <p>{item.description}</p>
              </div>
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}
