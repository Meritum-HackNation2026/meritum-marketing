import {loadFont as loadMono} from '@remotion/google-fonts/AzeretMono';
import {loadFont as loadSans} from '@remotion/google-fonts/SchibstedGrotesk';
import {continueRender, delayRender, staticFile} from 'remotion';

const sans = loadSans('normal', {weights: ['400', '500', '600', '700'], subsets: ['latin', 'latin-ext']});
const mono = loadMono('normal', {weights: ['400', '500'], subsets: ['latin', 'latin-ext']});

// Archivo is only the word "meritum" (650, width 112%), which needs the width axis: a local variable file.
const handle = delayRender('Archivo');
const archivo = new FontFace('Archivo', `url(${staticFile('fonts/archivo-latin-wdth-normal.woff2')}) format('woff2')`, {
  weight: '100 900',
  stretch: '62% 125%',
});

/** Resolves when every face is usable, so layout can be measured. */
export const fontsReady = Promise.all([
  sans.waitUntilDone(),
  mono.waitUntilDone(),
  archivo.load().then((face) => document.fonts.add(face)),
]).then(() => continueRender(handle));
