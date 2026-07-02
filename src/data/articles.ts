import articlesMarkdown from './articles.md?raw';
import { titleToSlug } from '../routing/slug';

// Auto-load every long-form article file from ./articles/*.md. Each file is
// a single self-contained article whose metadata (Title, Date, Reading, Link)
// sits at the top of the file, followed by a blank line and the body.
// Files whose basename starts with `_` are ignored so authors can keep
// scratchpads or templates next to real posts.
const longFormFiles = import.meta.glob<string>('./articles/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

export interface Article {
  /** URL-safe key derived from the title. Used for `#/words/<slug>`. */
  slug: string;
  /** Heading text — e.g. "On the geometry of cities". */
  title: string;
  /** ISO `YYYY-MM-DD`. */
  date: string;
  /** Free text, e.g. "8 min". May be undefined. */
  reading?: string;
  /** Optional URL for a secondary "read on original →" link. */
  link?: string;
  /** Preview paragraphs shown in the Voice card (no inline markdown). */
  excerpt: string[];
  /** Additional paragraphs shown only in the reader view. Empty if the
   *  markdown has no `---` separator. */
  body: string[];
}

/** Sentinel emitted by the parser for a lone `<br>` line — the reader
 *  renders this as a visible section break (extra vertical space). */
const SECTION_BREAK = '\u0000BR\u0000';

/**
 * Split raw body lines into `excerpt` (card preview) and `body`
 * (reader-only continuation) on a lone `---` line. Blank lines break
 * paragraphs; adjacent non-blank lines are joined with a single space.
 * A lone `<br>` (case-insensitive, optional `/`) becomes a section-break
 * sentinel so authors can force extra vertical space between paragraphs.
 *
 * Safety net: if the author never wrote a `---` but the article has more
 * than one real paragraph, treat the first paragraph as the intro and
 * shove the rest into `body` so long essays don't dump inline on the
 * Words page.
 */
function splitExcerptBody(lines: string[]): { excerpt: string[]; body: string[] } {
  const excerpt: string[] = [];
  const body: string[] = [];
  let target = excerpt;
  let sawSeparator = false;
  let buf: string[] = [];
  const flushBuf = () => {
    if (buf.length) {
      target.push(buf.join(' '));
      buf = [];
    }
  };
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '---') {
      flushBuf();
      target = body;
      sawSeparator = true;
      continue;
    }
    if (/^<br\s*\/?>$/i.test(trimmed)) {
      flushBuf();
      // Collapse adjacent section-break markers so `<br><br>` doesn't
      // stack multiple spacers.
      if (target[target.length - 1] !== SECTION_BREAK) {
        target.push(SECTION_BREAK);
      }
      continue;
    }
    if (trimmed === '') {
      flushBuf();
    } else {
      buf.push(trimmed);
    }
  }
  flushBuf();

  // Strip breaks that would render as awkward gaps:
  //   - leading/trailing breaks in the excerpt (top/bottom of the card
  //     and top of the reader)
  //   - trailing breaks in the body (bottom of the reader)
  // Leading breaks in `body` are kept: they sit between the intro and
  // the rest of the article in the reader view, which is exactly where
  // an author might want extra vertical space.
  while (excerpt[0] === SECTION_BREAK) excerpt.shift();
  while (excerpt[excerpt.length - 1] === SECTION_BREAK) excerpt.pop();
  while (body[body.length - 1] === SECTION_BREAK) body.pop();

  // Safety net uses only real paragraphs (ignore section breaks in count).
  const realExcerptCount = excerpt.filter((p) => p !== SECTION_BREAK).length;
  if (!sawSeparator && realExcerptCount > 1) {
    // Move everything after the first real paragraph into body, preserving
    // any section-break markers that follow it.
    const first = excerpt.find((p) => p !== SECTION_BREAK)!;
    const firstIdx = excerpt.indexOf(first);
    const rest = excerpt.slice(firstIdx + 1);
    return { excerpt: [first], body: rest };
  }
  return { excerpt, body };
}

export { SECTION_BREAK };

/**
 * Parse the multi-article `articles.md` file. Each `## Title` heading opens
 * a new article; lines that look like `Key: Value` under the heading are
 * pulled into metadata, and everything after the first blank line becomes
 * the body (splittable on `---`).
 *
 * The `## Format` block is filtered out because it has no `Date:` field —
 * articles without a date are silently dropped.
 */
function parseArticlesMarkdown(md: string): Article[] {
  const articles: Article[] = [];
  // Strip HTML comments (including multi-line) so `<!-- ... -->` can be used
  // to hide draft articles in this file without confusing the `##` scanner.
  const stripped = md.replace(/<!--[\s\S]*?-->/g, '');
  const lines = stripped.split(/\r?\n/);

  let current: {
    title: string;
    meta: Record<string, string>;
    body: string[];
    inBody: boolean;
  } | null = null;

  const flush = () => {
    if (!current) return;
    const date = current.meta.date;
    if (!date) {
      current = null;
      return;
    }
    const { excerpt, body } = splitExcerptBody(current.body);
    articles.push({
      slug: titleToSlug(current.title),
      title: current.title,
      date,
      reading: current.meta.reading,
      link: current.meta.link,
      excerpt,
      body,
    });
    current = null;
  };

  for (const rawLine of lines) {
    // Section headings (`## Title`) open a new article block.
    const heading = /^##\s+(.+?)\s*$/.exec(rawLine);
    if (heading) {
      flush();
      current = { title: heading[1], meta: {}, body: [], inBody: false };
      continue;
    }
    if (!current) continue;

    if (!current.inBody) {
      // Within the meta block, collect `Key: Value` pairs until first blank line.
      const trimmed = rawLine.trim();
      if (trimmed === '') {
        // Only transition to body once we've seen at least one meta line —
        // otherwise the blank line between the `## Title` and the meta block
        // shouldn't be treated as the end of metadata.
        if (Object.keys(current.meta).length > 0) current.inBody = true;
        continue;
      }
      const kv = /^([A-Za-z]+)\s*:\s*(.+)$/.exec(trimmed);
      if (kv) {
        current.meta[kv[1].toLowerCase()] = kv[2].trim();
        continue;
      }
      // Non-meta line — assume body has started.
      current.inBody = true;
      current.body.push(rawLine);
      continue;
    }

    current.body.push(rawLine);
  }

  flush();
  return articles;
}

/**
 * Parse a single standalone article file from `src/data/articles/`. The
 * whole file uses the same metadata + body grammar as one block inside
 * `articles.md`, but with a required `Title:` key instead of an `## H2`
 * heading (the filename is opaque — title comes from front-matter).
 *
 * Returns `null` (and logs in dev) when the file is missing `Title:` or
 * `Date:`, so a half-drafted file never renders as a broken card.
 */
function parseArticleFile(md: string, source: string): Article | null {
  const meta: Record<string, string> = {};
  const bodyLines: string[] = [];
  let inBody = false;
  // Same HTML-comment strip as the multi-article parser.
  const stripped = md.replace(/<!--[\s\S]*?-->/g, '');

  for (const rawLine of stripped.split(/\r?\n/)) {
    if (!inBody) {
      const trimmed = rawLine.trim();
      if (trimmed === '') {
        if (Object.keys(meta).length > 0) inBody = true;
        continue;
      }
      const kv = /^([A-Za-z]+)\s*:\s*(.+)$/.exec(trimmed);
      if (kv) {
        meta[kv[1].toLowerCase()] = kv[2].trim();
        continue;
      }
      inBody = true;
      bodyLines.push(rawLine);
      continue;
    }
    bodyLines.push(rawLine);
  }

  if (!meta.title || !meta.date) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn(`[articles] Skipping ${source}: missing Title or Date`);
    }
    return null;
  }

  const { excerpt, body } = splitExcerptBody(bodyLines);
  return {
    slug: titleToSlug(meta.title),
    title: meta.title,
    date: meta.date,
    reading: meta.reading,
    link: meta.link,
    excerpt,
    body,
  };
}

const shortForm = parseArticlesMarkdown(articlesMarkdown);

const longForm = Object.entries(longFormFiles)
  // Skip files whose basename starts with `_` (drafts, templates, notes).
  .filter(([path]) => !/\/_[^/]+\.md$/.test(path))
  .map(([path, md]) => parseArticleFile(md, path))
  .filter((a): a is Article => a !== null);

// Most recent first (string comparison works for ISO dates).
export const articles: Article[] = [...shortForm, ...longForm].sort((a, b) =>
  b.date.localeCompare(a.date),
);
