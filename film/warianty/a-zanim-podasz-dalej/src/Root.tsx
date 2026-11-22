import {Composition} from 'remotion';
import {Film} from './Film';
import './index.css';
import {FPS, TOTAL} from './timeline';

export const RemotionRoot = () => <Composition id="FilmA" component={Film} width={1920} height={1080} fps={FPS} durationInFrames={TOTAL} />;
