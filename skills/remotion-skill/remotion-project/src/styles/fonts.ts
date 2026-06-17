import { continueRender, delayRender } from 'remotion';

const FONTS = [
  ['Inter', 'url(https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2)'],
  ['Playfair Display', 'url(https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKeiukDX.woff2)'],
  ['JetBrains Mono', 'url(https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT.woff2)'],
] as const;

export const loadFonts = async (): Promise<void> => {
  const waitForFont = delayRender();
  try {
    await Promise.all(FONTS.map(async ([family, url]) => {
      const font = new FontFace(family, url);
      await font.load();
      document.fonts.add(font);
    }));
  } finally {
    continueRender(waitForFont);
  }
};
