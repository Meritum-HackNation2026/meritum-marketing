// Renders the film and brings it to -14 LUFS with a true peak of at most -1 dBTP (two-pass loudnorm).
// Run from this folder: node scripts/render.mjs   Output: meritum-film-c.mp4
import {execFileSync, spawnSync} from 'node:child_process';

const raw = 'out/raw.mp4';
const target = 'I=-14:TP=-1.5:LRA=11';
if (!process.argv.includes('--audio-only')) execFileSync('pnpm', ['exec', 'remotion', 'render', 'FilmC', raw, '--codec=h264', '--crf=16', '--color-space=bt709', '--x264-preset=slow', '--image-format=png', '--audio-bitrate=320k'], {stdio: 'inherit'});
const pass = spawnSync('ffmpeg', ['-hide_banner', '-i', raw, '-af', `loudnorm=${target}:print_format=json`, '-f', 'null', '-'], {encoding: 'utf8'});
const m = JSON.parse(pass.stderr.slice(pass.stderr.lastIndexOf('{'), pass.stderr.lastIndexOf('}') + 1));
const measured = `measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}`;
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', raw, '-af', `loudnorm=${target}:${measured}:linear=true`, '-ar', '48000', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '320k', '-movflags', '+faststart', 'meritum-film-c.mp4'], {stdio: 'inherit'});
const check = spawnSync('ffmpeg', ['-hide_banner', '-i', 'meritum-film-c.mp4', '-af', 'ebur128=peak=true', '-f', 'null', '-'], {encoding: 'utf8'});
console.log(check.stderr.slice(check.stderr.lastIndexOf('Summary:')));
