import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { articles, SECTION_BREAK, type Article } from '../data/articles';
import { bookGroups } from '../data/books';
import styles from './Words.module.css';

/** Smooth-scroll handler that respects reduced-motion. */
function scrollToId(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  e.preventDefault();
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
}

/** Format an ISO date as `15 April 2026`. */
function formatLongDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Year-only for the small-caps meta line under each article title. */
function formatYear(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return String(d.getFullYear());
}

export function Words() {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const articleCount = articles.length;
  const volumeCount = bookGroups.reduce((sum, g) => sum + g.books.length, 0);
  const yearCount = bookGroups.filter((g) => g.year !== null).length;

  return (
    <div className={styles.root}>
      <AnimatePresence mode="wait">
        {selectedArticle ? (
          <ArticleReader
            key={`reader-${selectedArticle.title}`}
            article={selectedArticle}
            onBack={() => setSelectedArticle(null)}
          />
        ) : (
          <motion.div
            key="library"
            className={styles.libraryView}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
      {/* ====================== CONTENTS — masthead ====================== */}
      <motion.nav
        className={styles.contents}
        aria-label="Page contents"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className={styles.contentsHead}>
          <span className={styles.contentsLabel}>Contents</span>
          <span className={styles.contentsIssue}>
            <span aria-hidden="true">№</span> {String(articleCount + volumeCount).padStart(2, '0')}
          </span>
        </div>

        <ol className={styles.contentsList}>
          <li className={styles.contentsItem}>
            <a
              className={styles.contentsLink}
              href="#words-voice"
              onClick={(e) => scrollToId(e, 'words-voice')}
            >
              <span className={styles.contentsRoman} aria-hidden="true">I</span>
              <span className={styles.contentsBody}>
                <span className={styles.contentsTitle}>Voice</span>
                <span className={styles.contentsLeader} aria-hidden="true" />
                <span className={styles.contentsKicker}>essays, notes, marginalia</span>
              </span>
              <span className={styles.contentsCount}>
                {String(articleCount).padStart(2, '0')} {articleCount === 1 ? 'article' : 'articles'}
              </span>
            </a>
          </li>
          <li className={styles.contentsItem}>
            <a
              className={styles.contentsLink}
              href="#words-index"
              onClick={(e) => scrollToId(e, 'words-index')}
            >
              <span className={styles.contentsRoman} aria-hidden="true">II</span>
              <span className={styles.contentsBody}>
                <span className={styles.contentsTitle}>Index</span>
                <span className={styles.contentsLeader} aria-hidden="true" />
                <span className={styles.contentsKicker}>
                  a working library {yearCount > 0 && <em>· {yearCount} {yearCount === 1 ? 'year' : 'years'}</em>}
                </span>
              </span>
              <span className={styles.contentsCount}>
                {String(volumeCount).padStart(2, '0')} {volumeCount === 1 ? 'volume' : 'volumes'}
              </span>
            </a>
          </li>
        </ol>

        <a
          className={styles.contentsHint}
          href="#words-voice"
          onClick={(e) => scrollToId(e, 'words-voice')}
        >
          <span className={styles.contentsHintArrow} aria-hidden="true" />
          <span>begin</span>
        </a>
      </motion.nav>

      {/* ====================== VOICE ====================== */}
      <section className={styles.section} aria-labelledby="words-voice">
        <header className={styles.sectionHeader}>
          <span className={styles.rule} aria-hidden="true" />
          <h2 id="words-voice" className={styles.sectionLabel}>Voice</h2>
          <span className={styles.rule} aria-hidden="true" />
        </header>

        <ol className={styles.articleList}>
          {articles.map((article, i) => (
            <motion.li
              key={article.title}
              className={styles.article}
              data-first={i === 0 || undefined}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.08, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className={styles.articleMeta}>
                <time dateTime={article.date}>{formatYear(article.date)}</time>
                {article.reading && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{article.reading.replace(/min$/, 'min read').replace(/min read read$/, 'min read')}</span>
                  </>
                )}
              </div>

              <h3 className={styles.articleTitle}>
                <button
                  type="button"
                  className={styles.articleTitleButton}
                  onClick={() => setSelectedArticle(article)}
                >
                  {article.title}
                </button>
              </h3>

              <div className={styles.articleExcerpt}>
                {article.excerpt.map((para, j) => (
                  <p key={j} data-paragraph={j === 0 && i === 0 ? 'dropcap' : undefined}>{para}</p>
                ))}
              </div>

              <div className={styles.articleFooter}>
                <span className={styles.articleDate}>{formatLongDate(article.date)}</span>
                <button
                  type="button"
                  className={styles.readOn}
                  onClick={() => setSelectedArticle(article)}
                >
                  keep reading <span aria-hidden="true">→</span>
                </button>
              </div>
            </motion.li>
          ))}
        </ol>
      </section>

      {/* ====================== INDEX ====================== */}
      <section className={styles.section} aria-labelledby="words-index">
        <header className={styles.sectionHeader}>
          <span className={styles.rule} aria-hidden="true" />
          <h2 id="words-index" className={styles.sectionLabel}>Index</h2>
          <span className={styles.rule} aria-hidden="true" />
        </header>

        <div className={styles.indexWrap}>
          {bookGroups.map((group, gi) => (
            <motion.div
              key={group.label}
              className={styles.indexGroup}
              data-pinned={group.year === null || undefined}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 + gi * 0.06, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className={styles.indexYear}>
                <span className={styles.indexYearLabel}>{group.label}</span>
                <span className={styles.indexCount}>
                  {group.books.length} {group.books.length === 1 ? 'volume' : 'volumes'}
                </span>
              </div>

              <ol className={styles.bookList}>
                {group.books.map((book, bi) => (
                  <li key={`${book.title}-${book.author}`} className={styles.bookRow}>
                    <span className={styles.bookNum}>{String(bi + 1).padStart(2, '0')}</span>
                    <span className={styles.bookAuthor}>
                      {book.author}
                      {book.authorEn && (
                        <span className={styles.bookAuthorEn} lang="en"> {book.authorEn}</span>
                      )}
                    </span>
                    <span className={styles.bookTitle}>
                      <em>{book.title}</em>
                      {book.titleEn && (
                        <span className={styles.bookTitleEn} lang="en">
                          <span className={styles.bookTitleEnSep} aria-hidden="true">·</span>
                          <em>{book.titleEn}</em>
                        </span>
                      )}
                      {book.note && <span className={styles.bookNote}>— {book.note}</span>}
                    </span>
                    {book.finished && (
                      <span className={styles.bookFinished}>{book.finished}</span>
                    )}
                  </li>
                ))}
              </ol>
            </motion.div>
          ))}
        </div>
      </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ==========================================================
   Article reader — full-length view for a single essay.
   Shares typographic language with the Voice cards: coral
   rules, italic display title, drop-cap on the first para.
   ========================================================== */
function ArticleReader({ article, onBack }: { article: Article; onBack: () => void }) {
  // When the reader opens, jump the page back to the top so the
  // reader header — not wherever the user clicked — is in view.
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  }, []);

  const paragraphs = [...article.excerpt, ...article.body];

  return (
    <motion.article
      className={styles.reader}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <button type="button" className={styles.readerBack} onClick={onBack}>
        <span className={styles.readerBackArrow} aria-hidden="true">&larr;</span>
        <span>back to Voice</span>
      </button>

      <header className={styles.readerHeader}>
        <div className={styles.readerMeta}>
          <time dateTime={article.date}>{formatLongDate(article.date)}</time>
          {article.reading && (
            <>
              <span aria-hidden="true">·</span>
              <span>{article.reading.replace(/min$/, 'min read').replace(/min read read$/, 'min read')}</span>
            </>
          )}
        </div>
        <h1 className={styles.readerTitle}>{article.title}</h1>
      </header>

      <div className={styles.readerBody}>
        {(() => {
          // Track the index of the first real paragraph so the drop-cap
          // lands on it (not on a section-break sentinel that may lead).
          const firstRealIdx = paragraphs.findIndex((p) => p !== SECTION_BREAK);
          return paragraphs.map((para, i) => {
            if (para === SECTION_BREAK) {
              return <div key={i} className={styles.readerBreak} aria-hidden="true" />;
            }
            return (
              <p key={i} data-paragraph={i === firstRealIdx ? 'dropcap' : undefined}>
                {para}
              </p>
            );
          });
        })()}
      </div>

      <footer className={styles.readerFooter}>
        {article.link && (
          <a
            className={styles.readOn}
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            read on original <span aria-hidden="true">→</span>
          </a>
        )}
        <button type="button" className={styles.readerBack} onClick={onBack}>
          <span className={styles.readerBackArrow} aria-hidden="true">&larr;</span>
          <span>back to Voice</span>
        </button>
      </footer>
    </motion.article>
  );
}
