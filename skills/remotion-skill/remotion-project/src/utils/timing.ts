import { Page } from './parseScript';

export function getPageFrameRange(page: Page, previousPages: Page[], fps: number): [number, number] {
  const startFrame = previousPages.reduce((sum, p) => sum + p.duration_sec * fps, 0);
  const endFrame = startFrame + page.duration_sec * fps;
  return [startFrame, endFrame];
}

export function getElementStartFrame(delay: number, pageStartFrame: number, fps: number): number {
  return pageStartFrame + delay * fps;
}

export function getPageCenterY(pageIndex: number, totalPages: number): number {
  return 540;
}
