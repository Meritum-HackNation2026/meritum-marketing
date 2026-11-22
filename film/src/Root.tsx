import {Composition} from 'remotion';
import {Film} from './Film';
import './index.css';

export const RemotionRoot = () => (
  <Composition id="MeritumFilm" component={Film} width={1920} height={1080} fps={30} durationInFrames={2560} />
);
