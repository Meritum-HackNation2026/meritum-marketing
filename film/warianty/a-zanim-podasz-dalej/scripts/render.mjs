// Renders the film and brings its sound to -14 LUFS with a true peak of -1 dBTP at most (two-pass loudnorm).
// Run: node scripts/render.mjs   (from the variant folder). Output: meritum-film-a.mp4.
import {execFileSync, spawnSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';

const RAW = 'out/surowy.mp4';
const OUT = 'meritum-film-a.mp4';
const TARGET = 'I=-14:LRA=11:TP=-1.5';
mkdirSync('out', {recursive: true});
execFileSync('npx', ['remotion', 'render', 'FilmA', RAW, '--codec=h264', '--crf=16', '--color-space=bt709', '--x264-preset=slow', '--image-format=png', '--audio-bitrate=320k'], {stdio: 'inherit'});

// pass 1 measures, pass 2 applies one linear gain (no pumping); the picture is copied untouched
const pass1 = spawnSync('ffmpeg', ['-hide_banner', '-i', RAW, '-af', `loudnorm=${TARGET}:print_format=json`, '-f', 'null', '-'], {encoding: 'utf8'}).stderr;
const m = JSON.parse(pass1.slice(pass1.lastIndexOf('{'), pass1.lastIndexOf('}') + 1));
const measured = `measured_I=${m.input_i}:measured_LRA=${m.input_lra}:measured_TP=${m.input_tp}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}`;
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', RAW, '-af', `loudnorm=${TARGET}:${measured}:linear=true,alimiter=limit=-1.5dB:level=false`, '-ar', '48000', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '320k', '-movflags', '+faststart', OUT], {stdio: 'inherit'});
const check = spawnSync('ffmpeg', ['-hide_banner', '-i', OUT, '-af', 'ebur128=peak=true', '-f', 'null', '-'], {encoding: 'utf8'}).stderr;
console.log(check.slice(check.lastIndexOf('Summary:')));
