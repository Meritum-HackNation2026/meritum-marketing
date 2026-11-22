// Renders still frames of the film. Usage: node scripts/make-stills.mjs <out-dir> <scale> <frame> [<frame> ...]
// Without frames it writes the set kept in film/kadry/ (one frame per scene, full size).
import {execFileSync} from 'node:child_process';
import {mkdirSync, mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const [out = 'kadry', scale = '1', ...frames] = process.argv.slice(2);
const set = frames.length ? frames : ['150', '330', '640', '930', '1250', '1340', '1500', '1720', '1990', '2230', '2470'];
const bundle = mkdtempSync(join(tmpdir(), 'meritum-film-'));
mkdirSync(out, {recursive: true});
execFileSync('npx', ['remotion', 'bundle', '--out-dir', bundle], {stdio: 'ignore'});
for (const f of set) {
  execFileSync('npx', ['remotion', 'still', bundle, 'MeritumFilm', join(out, `kadr-${f.padStart(4, "0")}.jpg`), `--frame=${f}`, `--scale=${scale}`, "--image-format=jpeg", "--jpeg-quality=90"], {stdio: 'ignore'});
  console.log('kadr', f);
}
