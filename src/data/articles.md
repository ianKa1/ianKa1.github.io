# Articles

Two ways to add a Voice essay:

**Short article** — add a `## Title` block to this file (see format below).
Good for one-shot notes, marginalia, aphorisms.

**Long article** — drop a self-contained `.md` file into `src/data/articles/`.
The whole file is one essay; the front-matter carries the metadata and the
body is as long as you want. Auto-discovered at build time — no registration.

Everything is merged and sorted newest-first by `Date:` before rendering.

## Format (short, in this file)

Under each `## Title`:
- `Date: YYYY-MM-DD` — required, used for sort order
- `Reading: N min` — optional reading-time estimate
- (Optional) `Link: https://…` — secondary "read on original →" link
- A blank line, then the **intro** paragraph(s) shown on the Words page
- (Optional) a lone `---` on its own line, then the rest of the article —
  everything after `---` is shown only in the reader (click a title to open)

If you skip `---` but write multiple paragraphs, the first paragraph is
automatically kept as the intro and the rest becomes reader-only body,
so long essays never spill onto the Words page unexpectedly.

## Format (long, one file per essay)

Filename: anything ending in `.md`. Kebab-case is nice
(`on-the-geometry-of-cities.md`) but not required. Files whose basename
starts with `_` are ignored (use for drafts / templates).

Layout of the file:

```
Title: On the geometry of cities
Date: 2026-04-15
Reading: 12 min
Link: https://your-blog.com/geometry-of-cities

Card excerpt paragraph one — the lede that draws readers in.

Optionally a second excerpt paragraph.

---

Rest of the article, reader-only. Add as many paragraphs as you like.
Blank lines break paragraphs; adjacent lines are joined into one.
```

`Title:` and `Date:` are required (files missing either are silently
dropped, with a dev-mode console warning).

Articles below are placeholders — replace with your own.

<!-- ## On the geometry of cities

Date: 2026-04-15
Reading: 8 min

A short excerpt of the opening paragraph — what made me start this piece,
the question it tries to answer. Two or three lines is enough to draw
someone in.

## Why I still keep paper notebooks

Date: 2026-02-01
Reading: 5 min

The case for graphite, longhand thinking, and the quiet defiance of an
analog tool in a digital life. There is something about resistance — the
drag of the pencil against fiber — that slows the hand enough for the
thought to catch up.

## A small theory of accidental beauty

Date: 2025-11-20
Reading: 6 min

Some of the most beautiful things in the world were never designed to be.
This is a meditation on the gardens that grow in cracked sidewalks, the
patina on a brass door handle, and the soft rounded corners that thousands
of fingertips carve into a wooden banister. -->
