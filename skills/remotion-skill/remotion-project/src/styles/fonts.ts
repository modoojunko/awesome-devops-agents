import { continueRender, delayRender } from 'remotion';

export const loadFonts = async (): Promise<void> => {
  const waitForFont = delayRender();
  try {
    const font = new FontFace(
      'Inter',
      'url(https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2)',
    );
    await font.load();
    document.fonts.add(font);
  } finally {
    continueRender(waitForFont);
  }
};
