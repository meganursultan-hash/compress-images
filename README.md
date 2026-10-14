# compress-images

Локальное сжатие картинок как в TinyPNG: PNG, JPG, WebP. Без API-ключей, без лимитов, файлы никуда не загружаются.

Local TinyPNG-style image compression for PNG, JPG and WebP. No API keys, no limits, nothing leaves your machine. [English below](#english).

```
logo.png                 148.8 KB →  45.2 KB  −70%
ui-screen.png            269.2 KB →  74.5 KB  −72%
photo.jpg                192.0 KB →  54.8 KB  −71%

Итого: 1249.5 KB → 419.3 KB (−66%), файлов: 10
```

## Быстрый старт

Нужен [Node.js](https://nodejs.org) 20.9 или новее. Устанавливать больше ничего не надо:

```bash
npx github:meganursultan-hash/compress-images ./assets
```

Сжатые копии появятся рядом, в папке `assets-compressed`. **Оригиналы не меняются.**

## Варианты

| Команда | Что делает |
|---|---|
| `npx github:meganursultan-hash/compress-images ./assets` | сжимает папку (вместе с подпапками) в `assets-compressed` |
| `... ./photo.jpg` | один файл, результат рядом: `photo.min.jpg` |
| `... ./assets --quality 65` | сжимает сильнее (по умолчанию 80, диапазон 1–100) |
| `... ./assets --out ./dist/img` | кладёт результат в указанную папку |
| `... ./assets --inplace` | заменяет оригиналы, только если экономия больше 3% |

## Что делает и чего не делает

- PNG сжимается с палитрой (как у TinyPNG), JPG — через mozjpeg, WebP пережимается с заданным качеством.
- Прозрачность сохраняется. Цвета Display P3 переводятся в sRGB без сдвига. EXIF-поворот применяется.
- Файл, который сжимается меньше чем на 3%, остаётся как есть. Поэтому повторный запуск не портит качество.
- Анимированные PNG и битые файлы пропускаются, остальные обрабатываются.
- `node_modules` и скрытые папки не трогаются.
- GIF и SVG пока не поддерживаются.

## Скилл для Claude

Если пользуетесь Claude Code, можно просто написать «сожми картинки в assets», и Claude всё сделает сам. Для этого скопируйте папку `skill` в `~/.claude/skills/compress-images/`:

```bash
mkdir -p ~/.claude/skills/compress-images
curl -o ~/.claude/skills/compress-images/SKILL.md \
  https://raw.githubusercontent.com/meganursultan-hash/compress-images/main/skill/SKILL.md
```

---

## English

Requires [Node.js](https://nodejs.org) 20.9+.

```bash
npx github:meganursultan-hash/compress-images ./assets
```

Compressed copies go to `assets-compressed`. **Originals are never touched** unless you pass `--inplace`.

| Flag | Effect |
|---|---|
| `--quality 65` | stronger compression (default 80, range 1–100) |
| `--out <dir>` | custom output folder |
| `--inplace` | replace originals, only when saving is above 3% |

A single file is written next to the original as `name.min.ext`. Transparency, colour (P3 → sRGB) and EXIF orientation are preserved. Animated PNGs and broken files are skipped. Files that would shrink by less than 3% are left untouched, so running it again won't degrade quality. Console output is in Russian.

**Claude Code skill:** copy `skill/SKILL.md` to `~/.claude/skills/compress-images/SKILL.md` and ask Claude to "compress the images in assets".

Built on [sharp](https://sharp.pixelplumbing.com). MIT license.
