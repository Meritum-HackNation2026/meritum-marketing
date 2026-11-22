import {Composition} from 'remotion';
import {Film} from './Film';

export const RemotionRoot = () => (
  <Composition id="MeritumFilmB" component={Film} width={1920} height={1080} fps={30} durationInFrames={1200} />
);
