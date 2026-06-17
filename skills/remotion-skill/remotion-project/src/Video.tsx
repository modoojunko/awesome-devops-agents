import { useCurrentFrame, useVideoConfig } from 'remotion';
import { parseScript, MediaScript, Page } from './utils/parseScript';
import { getPageFrameRange } from './utils/timing';
import { TitleLayout } from './layouts/TitleLayout';
import { BodyLayout } from './layouts/BodyLayout';
import { CodeLayout } from './layouts/CodeLayout';
import { BulletLayout } from './layouts/BulletLayout';
import { QuoteLayout } from './layouts/QuoteLayout';
import { SummaryLayout } from './layouts/SummaryLayout';
import { TasteParams } from './styles/theme';

const script: MediaScript = parseScript('./src/media-script.json');

const layoutComponents: Record<string, React.FC<{ page: Page; frame: number; fps: number; taste: TasteParams }>> = {
  title: TitleLayout,
  body: BodyLayout,
  code: CodeLayout,
  bullet: BulletLayout,
  quote: QuoteLayout,
  summary: SummaryLayout,
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
