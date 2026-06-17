import { useCurrentFrame, useVideoConfig } from 'remotion';
import { parseScript, Page } from './utils/parseScript';
import { TitleLayout } from './layouts/TitleLayout';
import { BodyLayout } from './layouts/BodyLayout';
import { CodeLayout } from './layouts/CodeLayout';
import { BulletLayout } from './layouts/BulletLayout';
import { QuoteLayout } from './layouts/QuoteLayout';
import { SummaryLayout } from './layouts/SummaryLayout';
import { TasteParams } from './styles/theme';

interface LayoutProps {
  page: Page;
  frame: number;
  fps: number;
  taste: TasteParams;
}

const script = parseScript('./src/media-script.json');

const layoutComponents: Record<string, React.FC<LayoutProps>> = {
  title: TitleLayout as React.FC<LayoutProps>,
  body: BodyLayout as React.FC<LayoutProps>,
  code: CodeLayout as React.FC<LayoutProps>,
  bullet: BulletLayout as React.FC<LayoutProps>,
  quote: QuoteLayout as React.FC<LayoutProps>,
  summary: SummaryLayout as React.FC<LayoutProps>,
};

export const Video: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  let accumulatedFrames = 0;
  for (const page of script.pages) {
    const pageFrames = page.duration_sec * fps;
    if (frame < accumulatedFrames + pageFrames) {
      const pageFrame = frame - accumulatedFrames;
      const Layout = layoutComponents[page.layout];
      if (!Layout) return null;
      return (
        <div style={{ width: 1920, height: 1080, backgroundColor: page.bg_color, overflow: 'hidden' }}>
          <Layout page={page} frame={pageFrame} fps={fps} taste={script.taste} />
        </div>
      );
    }
    accumulatedFrames += pageFrames;
  }
  return null;
};
