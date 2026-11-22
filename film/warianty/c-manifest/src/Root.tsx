import {Composition} from 'remotion';
import {Film, TOTAL} from './Film';
import './fonts';
import './index.css';

export const RemotionRoot = () => <Composition id="FilmC" component={Film} width={1920} height={1080} fps={30} durationInFrames={TOTAL} />;
