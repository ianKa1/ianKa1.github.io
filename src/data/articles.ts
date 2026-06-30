import articlesMarkdown from './articles.md?raw';

export interface Article {
  /** Heading text — e.g. "On the geometry of cities". */
  title: string;
  /** ISO `YYYY-MM-DD`. */
  date: string;
  /** Free text, e.g. "8 min". May be undefined. */
  reading?: string;
  /** Optional URL for the "read on →" link. */
  link?: string;
  /** Body excerpt as paragraphs (no inline markdown processing). */
  excerpt: string[];
}

/**
 * Parse `articles.md`. Each `## Title` heading opens an article. Lines that
 * look like `Key: Value` after the heading are pulled into metadata; everything
 * after the first blank line is collected as the excerpt body, broken into
 * paragraphs on blank lines.
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
    // Collapse runs of blank body lines into paragraph breaks.
    const paragraphs: string[] = [];
    let buf: string[] = [];
    for (const line of current.body) {
      if (line.trim() === '') {
        if (buf.length) {
          paragraphs.push(buf.join(' '));
          buf = [];
        }
      } else {
        buf.push(line.trim());
      }
    }
    if (buf.length) paragraphs.push(buf.join(' '));

    articles.push({
      title: current.title,
      date,
      reading: current.meta.reading,
      link: current.meta.link,
      excerpt: paragraphs,
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
