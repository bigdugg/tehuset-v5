/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './tina/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        text: 'var(--color-text)',
        accent: 'var(--color-accent)',
        pinkText: 'var(--color-pink-text)',
        altBgOne: 'var(--color-alt-bg-1)',
        altTextOne: 'var(--color-alt-text-1)',
        altBgTwo: 'var(--color-alt-bg-2)',
        altTextTwo: 'var(--color-alt-text-2)',
        footer: 'var(--color-footer)',
        menuSv: 'var(--color-menu-sv)',
        menuEn: 'var(--color-menu-en)',
        menuText: 'var(--color-menu-text)',
      },
      fontFamily: {
        din: ['var(--font-din)', 'sans-serif'],
        menu: ['var(--font-menu)', 'sans-serif'],
      },
      keyframes: {
        driftIn: { '0%': { opacity: '0', transform: 'translate3d(0, 32px, 0) rotate(-1.5deg)' }, '100%': { opacity: '1', transform: 'translate3d(0, 0, 0) rotate(0deg)' } },
        floatCurl: { '0%,100%': { transform: 'translate3d(0,0,0) rotate(-1deg)' }, '50%': { transform: 'translate3d(10px,-16px,0) rotate(1deg)' } },
        brushReveal: { '0%': { clipPath: 'inset(0 100% 0 0)' }, '100%': { clipPath: 'inset(0 0 0 0)' } },
      },
      animation: {
        driftIn: 'driftIn 1200ms cubic-bezier(.22,.88,.24,1) both',
        floatCurl: 'floatCurl 8200ms cubic-bezier(.42,0,.2,1) infinite',
        brushReveal: 'brushReveal 1400ms cubic-bezier(.25,.8,.2,1) both',
      },
    },
  },
  plugins: [],
};
