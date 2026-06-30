import booksMarkdown from './books.md?raw';

export interface Book {
  title: string;
  /** English title shown alongside a CJK `title`, when provided via the
   *  `中文 / English Title` slash-syntax in the markdown table. */
  titleEn?: string;
  author: string;
  /** English author shown alongside a CJK `author`, same slash-syntax. */
  authorEn?: string;
  finished?: string;
  note?: string;
  /** Year heading the book lived under, or `null` for "Currently Reading". */
  year: number | null;
}

/** True if the string contains any Han/CJK ideograph. */
function hasCJK(s: string): boolean {
  return /[\u3400-\u9FFF\uF900-\uFAFF]/.test(s);
}

/**
 * Split a bilingual cell on ` / ` (space-slash-space). Only treat the right
 * side as a translation when the left side contains CJK — English-only
 * values (even ones with internal slashes) are returned untouched.
 */
function splitBilingual(cell: string): { primary: string; en?: string } {
  const idx = cell.indexOf(' / ');
  if (idx === -1) return { primary: cell };
  const left = cell.slice(0, idx).trim();
  const right = cell.slice(idx + 3).trim();
  if (!left || !right) return { primary: cell };
  if (!hasCJK(left)) return { primary: cell };
  return { primary: left, en: right };
}

export interface BookGroup {
  /** `"Currently Reading"` or a year string like `"2026"`. */
  label: string;
  /** Numeric year for sorting, or `null` for the pinned "Currently Reading" group. */
  year: number | null;
  books: Book[];
}

/**
 * Parse `books.md` into year-grouped collections. Recognised headings:
 *   `## Currently Reading`  →  pinned group, year = null
 *   `## 2026`               →  year group
 * Tables under any other `## ` heading (e.g. `## Format`) are ignored.
 */
function parseBooksMarkdown(md: string): BookGroup[] {
  const groups: BookGroup[] = [];
  let current: BookGroup | null = null;

  for (const rawLine of md.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith('## ')) {
      const heading = line.slice(3).trim();
      if (/^currently reading$/i.test(heading)) {
        current = { label: 'Currently Reading', year: null, books: [] };
        groups.push(current);
      } else if (/^\d{4}$/.test(heading)) {
        current = { label: heading, year: Number(heading), books: [] };
        groups.push(current);
      } else {
        current = null;
      }
      continue;
    }

    if (!current) continue;
    if (!line.startsWith('|')) continue;

    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length === 0) continue;
    const first = cells[0].toLowerCase();
    if (first === 'title') continue;             // header row
    if (/^:?-+:?$/.test(first)) continue;        // separator

    const [rawTitle, rawAuthor, finished, note] = cells;
    if (!rawTitle || !rawAuthor) continue;

    const { primary: title, en: titleEn } = splitBilingual(rawTitle);
    const { primary: author, en: authorEn } = splitBilingual(rawAuthor);

    current.books.push({
      title,
      titleEn,
      author,
      authorEn,
      finished: finished ? finished : undefined,
      note: note ? note : undefined,
      year: current.year,
    });
  }

  // Pinned group first, then year-descending, then by year ascending (just in case).
  groups.sort((a, b) => {
    if (a.year === null) return -1;
    if (b.year === null) return 1;
    return b.year - a.year;
  });

  return groups.filter((g) => g.books.length > 0);
}

export const bookGroups: BookGroup[] = parseBooksMarkdown(booksMarkdown);
