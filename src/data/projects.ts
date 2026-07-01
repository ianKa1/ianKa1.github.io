/**
 * Systems projects are authored as one directory per project under
 * `src/data/projects/<id>/`, each holding a `project.md` (metadata +
 * long-form body) and any colocated media (`thumbnail.mp4`, images,
 * clips referenced by the body).
 *
 * The directory name becomes the project `id`, and directories are
 * loaded in ascending name order so authors can control card order
 * by renaming (e.g. prefixing `01-`, `02-`).
 */

// Raw markdown for every project.
const projectFiles = import.meta.glob<string>('./projects/*/project.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

// URL-resolved media colocated with each project. Keyed by full path so
// each project's markdown can reference files by filename and we can
// look them up in this map without walking the filesystem at runtime.
const projectMedia = import.meta.glob<string>(
  './projects/*/*.{mp4,webm,ogg,mov,m4v,png,jpg,jpeg,gif,webp,avif,svg}',
  {
    query: '?url',
    import: 'default',
    eager: true,
  },
);

/** One `## Heading` section of the long-form body. */
export interface ProjectSection {
  heading: string;
  paragraphs: string[];
}

export interface Project {
  /** Directory name, e.g. `"project-1"`. */
  id: string;
  title: string;
  subtitle?: string;
  /** Resolved URL for the card + hero media. */
  thumbnail: string;
  thumbnailType: 'image' | 'video';
  year?: string;
  tags?: string[];
  /** Long-form body, one entry per `## Heading` in `project.md`. */
  sections: ProjectSection[];
}

function isVideoFile(filename: string): boolean {
  return /\.(mp4|webm|ogg|mov|m4v)$/i.test(filename);
}

/**
 * Split a project.md into a metadata header (`Key: Value` lines until
 * the first blank line) and a body that's carved up by `## Heading`
 * lines into sections of blank-line-separated paragraphs.
 */
function parseProjectMarkdown(md: string): {
  meta: Record<string, string>;
  sections: ProjectSection[];
} {
  // Same HTML-comment strip as the article parser so `<!-- ... -->` can
  // hide drafts without confusing the section scanner.
  const stripped = md.replace(/<!--[\s\S]*?-->/g, '');
  const meta: Record<string, string> = {};
  const sections: ProjectSection[] = [];

  let inBody = false;
  let currentSection: ProjectSection | null = null;
  let paragraphBuf: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuf.length && currentSection) {
      currentSection.paragraphs.push(paragraphBuf.join(' '));
      paragraphBuf = [];
    }
  };

  const flushSection = () => {
    flushParagraph();
    if (currentSection) sections.push(currentSection);
    currentSection = null;
  };

  for (const rawLine of stripped.split(/\r?\n/)) {
    const trimmed = rawLine.trim();

    if (!inBody) {
      if (trimmed === '') {
        if (Object.keys(meta).length > 0) inBody = true;
        continue;
      }
      const kv = /^([A-Za-z]+)\s*:\s*(.+)$/.exec(trimmed);
      if (kv) {
        meta[kv[1].toLowerCase()] = kv[2].trim();
        continue;
      }
      // First non-meta, non-blank line: assume body has started.
      inBody = true;
      // Fall through to body handling below.
    }

    const heading = /^##\s+(.+?)\s*$/.exec(rawLine);
    if (heading) {
      flushSection();
      currentSection = { heading: heading[1], paragraphs: [] };
      continue;
    }

    if (trimmed === '') {
      flushParagraph();
      continue;
    }

    // Body text before the first `## Heading` is dropped. Authors should
    // start with a heading; the type contract doesn't model an untitled
    // preamble.
    if (!currentSection) continue;
    paragraphBuf.push(trimmed);
  }

  flushSection();

  return { meta, sections };
}

/** Split a comma-separated tag list; trim + drop empties. */
function parseTags(raw: string | undefined): string[] | undefined {
  if (!raw) return undefined;
  const tags = raw.split(',').map((t) => t.trim()).filter(Boolean);
  return tags.length ? tags : undefined;
}

function loadProjects(): Project[] {
  const projects: Project[] = [];

  // Iterate in stable, name-ascending order so authors control card
  // order via directory naming.
  const entries = Object.entries(projectFiles).sort(([a], [b]) => a.localeCompare(b));

  for (const [path, md] of entries) {
    // `./projects/project-1/project.md` → `project-1`
    const idMatch = /\/projects\/([^/]+)\/project\.md$/.exec(path);
    if (!idMatch) continue;
    const id = idMatch[1];

    const { meta, sections } = parseProjectMarkdown(md);
    if (!meta.title) {
      if (import.meta.env.DEV) {
        console.warn(`[projects] Skipping ${id}: missing Title`);
      }
      continue;
    }
    if (!meta.thumbnail) {
      if (import.meta.env.DEV) {
        console.warn(`[projects] Skipping ${id}: missing Thumbnail`);
      }
      continue;
    }

    // Resolve `Thumbnail: filename` against the URL map. Media are keyed
    // by their glob path, so we build the same shape to look them up.
    const mediaKey = `./projects/${id}/${meta.thumbnail}`;
    const thumbnailUrl = projectMedia[mediaKey];
    if (!thumbnailUrl) {
      if (import.meta.env.DEV) {
        console.warn(`[projects] ${id}: thumbnail "${meta.thumbnail}" not found in project directory`);
      }
      continue;
    }

    const thumbnailType: Project['thumbnailType'] =
      meta.thumbnailtype === 'image' || meta.thumbnailtype === 'video'
        ? meta.thumbnailtype
        : isVideoFile(meta.thumbnail)
          ? 'video'
          : 'image';

    projects.push({
      id,
      title: meta.title,
      subtitle: meta.subtitle,
      thumbnail: thumbnailUrl,
      thumbnailType,
      year: meta.year,
      tags: parseTags(meta.tags),
      sections,
    });
  }

  return projects;
}

export const projects: Project[] = loadProjects();
