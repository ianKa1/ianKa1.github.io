import articlesMarkdown from './articles.md?raw';

export interface Article {
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

/**
 * Parse `articles.md`. Each `## Title` heading opens an article. Lines that
 * look like `Key: Value` after the heading are pulled into metadata; everything
 * after the first blank line is collected as the article body, broken into
 * paragraphs on blank lines. A single line of `---` splits the body into
 * `excerpt` (card preview) and `body` (reader-only continuation).
 *
 * The first `## ` block under a non-content heading (e.g. `## Format`) is
 * filtered out by requiring a `Date:` field — articles without a date are
 * silently dropped, matching the loader's contract.
 */
function parseArticlesMarkdown(md: string): Article[] {
  const articles: Article[] = [];
  const lines = md.split(/\r?\n/);

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
    // Collapse runs of blank body lines into paragraph breaks. A lone `---`
    // marks the excerpt/body cut; paragraphs before it are the card preview,
    // paragraphs after are shown only in the reader.
    const excerpt: string[] = [];
    const body: string[] = [];
    let target = excerpt;
    let buf: string[] = [];
    const flushBuf = () => {
      if (buf.length) {
        target.push(buf.join(' '));
        buf = [];
      }
    };
    for (const line of current.body) {
      const trimmed = line.trim();
      if (trimmed === '---') {
        flushBuf();
        target = body;
        continue;
      }
      if (trimmed === '') {
        flushBuf();
      } else {
        buf.push(trimmed);
      }
    }
    flushBuf();

    articles.push({
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

  // Most recent first (string comparison works for ISO dates).
  articles.sort((a, b) => b.date.localeCompare(a.date));
  return articles;
}

export const articles: Article[] = parseArticlesMarkdown(articlesMarkdown);
