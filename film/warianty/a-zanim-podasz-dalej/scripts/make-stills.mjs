// Renders still frames of the film. Usage: node scripts/make-stills.mjs <out-dir> <scale> <frame> [<frame> ...]
// Without frames it writes the set kept in kadry/ (one frame per shot, full size).
import {execFileSync} from 'node:child_process';
import {mkdirSync, mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const [out = 'kadry', scale = '1', ...frames] = process.argv.slice(2);
const set = frames.length ? frames : ['40', '120', '165', '230', '275', '316', '440', '560', '680', '770', '930', '1030', '1150'];
const bundle = mkdtempSync(join(tmpdir(), 'meritum-film-'));
mkdirSync(out, {recursive: true});
execFileSync('npx', ['remotion', 'bundle', '--out-dir', bundle], {stdio: 'ignore'});
for (const f of set) {
  execFileSync('npx', ['remotion', 'still', bundle, 'FilmA', join(out, `kadr-${f.padStart(4, "0")}.jpg`), `--frame=${f}`, `--scale=${scale}`, "--image-format=jpeg", "--jpeg-quality=90"], {stdio: 'ignore'});
  console.log('kadr', f);
}
