import { Sequence, useVideoConfig } from 'remotion';
import { TitleLayout } from './layouts/TitleLayout';
import { BodyLayout } from './layouts/BodyLayout';
import { CodeLayout } from './layouts/CodeLayout';
import { BulletLayout } from './layouts/BulletLayout';
import { QuoteLayout } from './layouts/QuoteLayout';
import { SummaryLayout } from './layouts/SummaryLayout';
import { Page } from './utils/parseScript';
import script from './media-script.json';

const layoutComponents: Record<string, React.FC<{ page: Page; taste: typeof script.taste }>> = {
  title: TitleLayout as React.FC<{ page: Page; taste: typeof script.taste }>,
  body: BodyLayout as React.FC<{ page: Page; taste: typeof script.taste }>,
  code: CodeLayout as React.FC<{ page: Page; taste: typeof script.taste }>,
  bullet: BulletLayout as React.FC<{ page: Page; taste: typeof script.taste }>,
  quote: QuoteLayout as React.FC<{ page: Page; taste: typeof script.taste }>,
  summary: SummaryLayout as React.FC<{ page: Page; taste: typeof script.taste }>,
};

export const Video: React.FC = () => {
  const { fps } = useVideoConfig();
  let accumulatedFrames = 0;

  return (
    <div style={{ width: 1920, height: 1080, overflow: 'hidden' }}>
      {script.pages.map((page) => {
        const pageFrames = page.duration_sec * fps;
        const from = accumulatedFrames;
        accumulatedFrames += pageFrames;
        const Layout = layoutComponents[page.layout];
        if (!Layout) return null;
        return (
          <Sequence key={page.id} from={from} durationInFrames={pageFrames}>
            <div
              style={{
                width: 1920,
                height: 1080,
                backgroundColor: page.bg_color,
                backgroundImage: page.bg_gradient || undefined,
              }}
            >
              <Layout page={page} taste={script.taste} />
            </div>
          </Sequence>
        );
      })}
    </div>
  );
};
