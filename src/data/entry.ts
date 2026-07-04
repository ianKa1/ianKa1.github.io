import entryRaw from './entry.md?raw';

/**
 * Entry page content, authored in `entry.md` as blocks separated by
 * lone `---` lines. Blocks are identified by content, not position:
 *
 *   - The favorites block is the one containing `Label: Value` lines
 *     (any other lines in it become the lead-in sentence).
 *   - Everything before it is bio — any number of paragraph blocks.
 *   - Everything after it is mottos — one motto per paragraph.
 */
export interface EntryContent {
  bio: string[];
  /** Lead-in sentence above the favorites list. */
  favoritesIntro: string;
  favorites: { label: string; value: string }[];
  /** One motto per paragraph; each renders as its own wall card. */
  mottos: string[];
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

const FAVORITE_LINE = /^([^:]+):\s*(.+)$/;

function parseEntry(raw: string): EntryContent {
  const blocks = splitBlocks(raw);

  // The favorites block is the one that contains `Label: Value` lines.
  const favIndex = blocks.findIndex((lines) =>
    lines.some((line) => FAVORITE_LINE.test(line.trim())),
  );

  const bioBlocks = favIndex === -1 ? blocks : blocks.slice(0, favIndex);
  const favoriteLines = favIndex === -1 ? [] : blocks[favIndex];
  const mottoBlocks = favIndex === -1 ? [] : blocks.slice(favIndex + 1);

  // `Label: Value` lines become rows; any other non-blank lines form
  // the intro sentence shown above the list.
  const favorites: EntryContent['favorites'] = [];
  const introLines: string[] = [];
  for (const line of favoriteLines) {
    const match = line.trim().match(FAVORITE_LINE);
    if (match) favorites.push({ label: match[1].trim(), value: match[2].trim() });
    else if (line.trim()) introLines.push(line.trim());
  }

  return {
    bio: bioBlocks.flatMap(toParagraphs),
    favoritesIntro: introLines.join(' '),
    favorites,
    mottos: mottoBlocks.flatMap(toParagraphs),
  };
}

export const entryContent: EntryContent = parseEntry(entryRaw);
