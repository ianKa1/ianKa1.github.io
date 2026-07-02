/**
 * Tech projects are authored as one directory per project under
 * `src/data/projects/<id>/`, each holding a `project.md` (metadata +
 * long-form body) and any colocated media (`thumbnail.mp4`, images,
 * clips referenced by the body).
 *
 * The directory name becomes the project `id`, and directories are
 * loaded in ascending name order so authors can control card order
 * by renaming (e.g. prefixing `01-`, `02-`).
 *
 * The body is CommonMark markdown with math delimiters (`$...$` and
 * `$$...$$`). Rendering is handled downstream by react-markdown +
 * remark-math + rehype-katex; this loader only carves the file into
 * `## Heading` sections and rewrites relative image paths so
 * `![](figure.png)` and `![](results/foo.png)` resolve against the
 * project directory's colocated media.
 */

// Raw markdown for every project.
const projectFiles = import.meta.glob<string>('./projects/*/project.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

// URL-resolved media colocated with each project (including nested
// subdirectories like `results/city0.png`). Keyed by full glob path
// so `project.md` can reference files by relative path and we can
// look them up without walking the filesystem at runtime.
const projectMedia = import.meta.glob<string>(
  './projects/*/**/*.{mp4,webm,ogg,mov,m4v,png,jpg,jpeg,gif,webp,avif,svg}',
  {
    query: '?url',
    import: 'default',
    eager: true,
  },
);

/** One `## Heading` section of the long-form body. */
export interface ProjectSection {
  heading: string;
  /** Raw markdown body for the section (paragraphs, lists, images, math). */
  body: string;
}

export interface Project {
  /** Directory name, e.g. `"project-1"`. */
  id: string;
  title: string;
  subtitle?: string;
  /** Resolved URL for the card + hero media. */
  thumbnail: string;
  thumbnailType: 'image' | 'video';
  /** Optional still-image URL rendered on the card at rest when the
   *  thumbnail is a video; on hover the video fades in and plays. */
  cover?: string;
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
 * lines into sections. Each section's body is kept as raw markdown so
 * the renderer downstream can handle lists, math, images, etc.
 */
function parseProjectMarkdown(md: string): {
  meta: Record<string, string>;
  sections: ProjectSection[];
} {
  // Strip HTML comments so `<!-- ... -->` can hide drafts without
  // confusing the section scanner.
  const stripped = md.replace(/<!--[\s\S]*?-->/g, '');
  const meta: Record<string, string> = {};
  const sections: ProjectSection[] = [];

  let inBody = false;
  let currentSection: ProjectSection | null = null;
  let bodyLines: string[] = [];

  const flushSection = () => {
    if (currentSection) {
      currentSection.body = bodyLines.join('\n').replace(/^\n+|\n+$/g, '');
      sections.push(currentSection);
    }
    currentSection = null;
    bodyLines = [];
  };

  const lines = stripped.split(/\r?\n/);
  for (const rawLine of lines) {
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
      // First non-meta, non-blank line: assume body has started.
      inBody = true;
      // Fall through to body handling below.
    }

    const heading = /^##\s+(.+?)\s*$/.exec(rawLine);
    if (heading) {
      flushSection();
      currentSection = { heading: heading[1], body: '' };
      continue;
    }

    // Body text before the first `## Heading` is dropped. Authors should
    // start with a heading; the type contract doesn't model an untitled
    // preamble.
    if (!currentSection) continue;
    bodyLines.push(rawLine);
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

/**
 * Rewrite `![alt](relative/path.png)` occurrences in a section body so
 * they point at the URLs Vite emits for colocated media. Absolute URLs
 * (`http://`, `https://`, `//`, `data:`) are left untouched.
 */
function rewriteMediaPaths(body: string, projectId: string): string {
  return body.replace(
    /(!\[[^\]]*\]\()([^)\s]+)(\s*(?:"[^"]*")?\s*\))/g,
    (match, prefix: string, url: string, suffix: string) => {
      if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:')) return match;
      const normalized = url.replace(/^\.\//, '');
      const mediaKey = `./projects/${projectId}/${normalized}`;
      const resolved = projectMedia[mediaKey];
      if (!resolved) {
        if (import.meta.env.DEV) {
          console.warn(`[projects] ${projectId}: image "${url}" not found in project directory`);
        }
        return match;
      }
      return `${prefix}${resolved}${suffix}`;
    },
  );
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

    // Optional still-image poster for video thumbnails. Resolved through
    // the same media map; if the author points at a missing file we
    // ignore it (dev warning) so the card falls back to the video-only
    // behaviour instead of breaking the grid.
    let coverUrl: string | undefined;
    if (meta.cover) {
      const coverKey = `./projects/${id}/${meta.cover}`;
      coverUrl = projectMedia[coverKey];
      if (!coverUrl && import.meta.env.DEV) {
        console.warn(`[projects] ${id}: cover "${meta.cover}" not found in project directory`);
      }
    }

    // Rewrite image references in each section body so the renderer
    // receives fully-resolved URLs.
    const resolvedSections = sections.map((section) => ({
      heading: section.heading,
      body: rewriteMediaPaths(section.body, id),
    }));

    projects.push({
      id,
      title: meta.title,
      subtitle: meta.subtitle,
      thumbnail: thumbnailUrl,
      thumbnailType,
      cover: coverUrl,
      year: meta.year,
      tags: parseTags(meta.tags),
      sections: resolvedSections,
    });
  }

  return projects;
}

export const projects: Project[] = loadProjects();
