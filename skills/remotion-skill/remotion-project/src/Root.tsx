import { useEffect } from 'react';
import { Composition } from 'remotion';
import { Video } from './Video';
import { loadFonts } from './styles/fonts';
import script from './media-script.json';

export const RemotionRoot: React.FC = () => {
  useEffect(() => { loadFonts(); }, []);

  return (
    <Composition
      id="Video"
      component={Video}
      durationInFrames={script.meta.fps * script.meta.total_duration_sec}
      fps={script.meta.fps}
      width={1920}
      height={1080}
    />
  );
};
