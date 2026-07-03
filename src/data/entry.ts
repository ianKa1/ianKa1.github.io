import entryRaw from './entry.md?raw';

/**
 * Entry page content, authored in `entry.md` as four blocks separated by
 * lone `---` lines, in fixed order:
 *
 *   1. Bio — one or more paragraphs of self-introduction
 *   2. Motivation — a single continuation line (why America)
 *   3. Favorites — `Label: Value` lines, one per row
 *   4. Motto — the closing epigraph
 */
export interface EntryContent {
  bio: string[];
  motivation: string;
  /** Lead-in sentence above the favorites list. */
  favoritesIntro: string;
  favorites: { label: string; value: string }[];
  motto: string;
}

/** Split raw markdown into blocks on lone `---` lines. */
function splitBlocks(raw: string): string[][] {
  const blocks: string[][] = [[]];
  for (const line of raw.split('\n')) {
    if (line.trim() === '---') blocks.push([]);
    else blocks[blocks.length - 1].push(line);
  }
  return blocks;
}

/** Join adjacent non-blank lines into paragraphs; blank lines separate. */
function toParagraphs(lines: string[]): string[] {
  const paragraphs: string[] = [];
  let buf: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (buf.length) paragraphs.push(buf.join(' '));
      buf = [];
    } else {
      buf.push(trimmed);
    }
  }
  if (buf.length) paragraphs.push(buf.join(' '));
  return paragraphs;
}

function parseEntry(raw: string): EntryContent {
  const [bioLines = [], motivationLines = [], favoriteLines = [], mottoLines = []] =
    splitBlocks(raw);

  // `Label: Value` lines become rows; any other non-blank lines form
  // the intro sentence shown above the list.
  const favorites: EntryContent['favorites'] = [];
  const introLines: string[] = [];
  for (const line of favoriteLines) {
    const match = line.match(/^([^:]+):\s*(.+)$/);
    if (match) favorites.push({ label: match[1].trim(), value: match[2].trim() });
    else if (line.trim()) introLines.push(line.trim());
  }

  return {
    bio: toParagraphs(bioLines),
    motivation: toParagraphs(motivationLines).join(' '),
    favoritesIntro: introLines.join(' '),
    favorites,
    motto: toParagraphs(mottoLines).join(' '),
  };
}

export const entryContent: EntryContent = parseEntry(entryRaw);
