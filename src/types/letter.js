/**
 * @typedef {{
 *   backgroundColor?: string,
 *   accentColor?: string,
 *   textColor?: string
 * }} LetterTheme
 *
 * @typedef {{
 *   enabled?: boolean,
 *   text?: string,
 *   image?: string
 * }} LetterBanner
 *
 * @typedef {{
 *   slug: string,
 *   isoDate: string,
 *   displayDate: string,
 *   galleryLabel: string,
 *   title: string,
 *   subtitle?: string,
 *   image: string,
 *   paragraphs: string[],
 *   sameDayOrder?: number,
 *   password?: string,
 *   theme?: LetterTheme,
 *   banner?: LetterBanner
 * }} Letter
 */

export const DEFAULT_THEME = {
  backgroundColor: '#4b0082',
  accentColor: '#cf9fff',
  textColor: '#f7f2ff'
};

/** @returns {Letter} */
export function createEmptyLetter() {
  const today = new Date();
  const iso = today.toISOString().slice(0, 10);
  const display = today.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  const slug = `${iso}-new-story`;

  return {
    slug,
    isoDate: iso,
    displayDate: display,
    galleryLabel: `${display.slice(0, 3)} · New story`,
    title: 'New story',
    subtitle: '',
    image: `https://picsum.photos/seed/${slug}/900/700`,
    paragraphs: ['Dear Ava,', 'Your words here.', 'Love,\nLucas'],
    theme: { ...DEFAULT_THEME },
    banner: { enabled: false, text: '', image: '' }
  };
}

/** @param {Letter} letter */
export function letterThemeVars(letter) {
  const theme = { ...DEFAULT_THEME, ...letter.theme };
  return {
    '--letter-bg': theme.backgroundColor,
    '--letter-accent': theme.accentColor,
    '--letter-text': theme.textColor
  };
}
