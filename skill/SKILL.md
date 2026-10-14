---
name: compress-images
description: Compresses images (PNG, JPG, WebP) like TinyPNG, locally and without an API. Use when the user asks to compress, optimize or reduce the size of images, a file or an assets folder. Сжимает картинки, когда просят сжать или оптимизировать изображения.
---

# Compress images

The user may not be a developer. Do the technical part yourself: don't show commands or ask them to run anything. Reply with a clear, plain result in the user's language.

## Where to run

On the user's computer, in the local shell. If no folder or file was named, ask what to compress. If the project has one obvious image folder (`assets`, `images`, `public/img`), suggest it.

## Step 1. Check Node.js

Run `node -v`. Node.js 20.9 or newer is required. If it's missing, tell the user in one sentence and offer to install it (`brew install node` on macOS with Homebrew, or the LTS installer from nodejs.org).

## Step 2. Compress

```bash
npx -y github:meganursultan-hash/compress-images "<folder or file>"
```

The first run downloads the tool (up to a minute). Wait for it to finish.

- By default originals are untouched. A folder's result goes next to it into `<folder>-compressed`, a single file's result goes next to it as `<name>.min.<ext>`.
- "Stronger", "smaller" → add `--quality 65`. "Quality matters more" → `--quality 90`. The default is 80.
- Use `--inplace` (replace originals) only when the user explicitly asks to replace the files. Confirm once before doing it.
- The tool itself skips broken files, animated PNGs and already-optimal images. It never touches `node_modules` or hidden folders.

## Step 3. Reply

Keep it short and non-technical:
- total: before → after, percentage saved, number of files;
- where the compressed files are, in plain words;
- a table of files: all of them if there are 15 or fewer, otherwise the 5 heaviest;
- if something wasn't compressed, explain why in plain words (broken file, animation, already optimal);
- offer to replace the originals if the result looks good.
