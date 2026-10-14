#!/usr/bin/env node
// version: 2
// Сжатие картинок (аналог TinyPNG), локально, без API и лимитов.
// Использование:
//   node compress-images.mjs <папка|файл> [--out <папка>] [--quality 80] [--inplace]
// По умолчанию оригиналы не меняются:
//   папка → результат в "<папка>-compressed", файл → рядом как "<имя>.min.<ext>".
// --inplace заменяет файл, только если сжатая версия заметно меньше оригинала.

import { readdir, stat, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const MIN_SAVING = 0.03; // меньше 3% экономии — оставляем оригинал (не портим качество повторным пережатием)
const VALUE_FLAGS = new Set(['--out', '--quality']);

const args = process.argv.slice(2);
const positional = args.filter((a, i) => !a.startsWith('--') && !VALUE_FLAGS.has(args[i - 1]));
const input = positional[0];
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : fallback;
};
const inplace = args.includes('--inplace');
const quality = Number(flag('quality', 80));

if (!input) {
  console.error('Укажи папку или файл: node compress-images.mjs <папка|файл> [--out <папка>] [--quality 80] [--inplace]');
  process.exit(1);
}
if (!Number.isInteger(quality) || quality < 1 || quality > 100) {
  console.error('--quality должно быть целым числом от 1 до 100');
  process.exit(1);
}

const EXT = new Set(['.png', '.jpg', '.jpeg', '.webp']);

async function collect(p, skip) {
  const s = await stat(p);
  if (s.isFile()) return EXT.has(path.extname(p).toLowerCase()) ? [p] : [];
  const out = [];
  for (const e of await readdir(p, { withFileTypes: true })) {
    const full = path.join(p, e.name);
    if (e.name === 'node_modules' || e.name.startsWith('.') || full === skip) continue;
    if (e.isDirectory() || e.isFile()) out.push(...(await collect(full, skip)));
  }
  return out;
}

async function compress(buf, ext) {
  // Анимированный PNG (APNG, блок acTL до IDAT) sharp склеил бы в один кадр — такие не трогаем.
  const actl = buf.indexOf('acTL');
  if (ext === '.png' && actl !== -1 && actl < buf.indexOf('IDAT')) return null;
  const img = sharp(buf, { animated: ext === '.webp' }).rotate();
  if (ext === '.png') return img.png({ palette: true, quality, compressionLevel: 9, effort: 10 }).toBuffer();
  if (ext === '.webp') return img.webp({ quality, effort: 6 }).toBuffer();
  return img.jpeg({ quality, mozjpeg: true }).toBuffer();
}

const fmt = (n) => (n / 1024).toFixed(1).padStart(8) + ' KB';

const root = path.resolve(input);
const isDir = (await stat(root)).isDirectory();
const outRoot = path.resolve(flag('out', isDir ? `${root}-compressed` : path.dirname(root)));
const files = await collect(root, outRoot);

if (!files.length) {
  console.log('Картинок не найдено.');
  process.exit(0);
}

let before = 0;
let after = 0;
const failed = [];
for (const file of files) {
  const ext = path.extname(file).toLowerCase();
  const rel = isDir ? path.relative(root, file) : path.basename(file);
  try {
    const orig = await readFile(file);
    const compressed = await compress(orig, ext);
    const useOrig = !compressed || compressed.length > orig.length * (1 - MIN_SAVING);
    const result = useOrig ? orig : compressed;

    let dest = inplace ? file : path.join(outRoot, rel);
    if (!inplace && !isDir && !flag('out')) dest = file.slice(0, -ext.length) + '.min' + path.extname(file);
    if (!inplace && dest === file) throw new Error('путь результата совпадает с оригиналом, укажи другой --out');
    if (!inplace || !useOrig) {
      await mkdir(path.dirname(dest), { recursive: true });
      await writeFile(dest, result);
    }

    before += orig.length;
    after += result.length;
    const saved = (((orig.length - result.length) / orig.length) * 100).toFixed(0);
    const note = !compressed ? '  (анимация, оставлен как есть)' : useOrig ? '  (уже оптимален, оставлен как есть)' : '';
    console.log(`${rel.padEnd(40)} ${fmt(orig.length)} → ${fmt(result.length)}  −${saved}%${note}`);
  } catch (err) {
    failed.push(rel);
    console.error(`${rel.padEnd(40)} ОШИБКА: ${err.message}`);
  }
}

if (before) {
  const total = (((before - after) / before) * 100).toFixed(0);
  console.log(`\nИтого: ${fmt(before)} → ${fmt(after)}  (−${total}%), файлов: ${files.length - failed.length}`);
}
if (failed.length) console.log(`Не обработано: ${failed.length} (${failed.join(', ')})`);
if (!inplace) console.log(`Результат: ${isDir || flag('out') ? outRoot : 'рядом с файлом, *.min.*'}`);
process.exitCode = failed.length ? 1 : 0;
