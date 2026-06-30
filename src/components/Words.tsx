import { motion } from 'motion/react';
import { articles } from '../data/articles';
import { bookGroups } from '../data/books';
import styles from './Words.module.css';

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
  return (
    <div className={styles.root}>
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
                {article.link ? (
                  <a href={article.link} target="_blank" rel="noopener noreferrer">{article.title}</a>
                ) : (
                  <span>{article.title}</span>
                )}
              </h3>

              <div className={styles.articleExcerpt}>
                {article.excerpt.map((para, j) => (
                  <p key={j} data-paragraph={j === 0 && i === 0 ? 'dropcap' : undefined}>{para}</p>
                ))}
              </div>

              <div className={styles.articleFooter}>
                <span className={styles.articleDate}>{formatLongDate(article.date)}</span>
                {article.link && (
                  <a className={styles.readOn} href={article.link} target="_blank" rel="noopener noreferrer">
                    read on <span aria-hidden="true">→</span>
                  </a>
                )}
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
                    <span className={styles.bookAuthor}>{book.author}</span>
                    <span className={styles.bookTitle}>
                      <em>{book.title}</em>
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
    </div>
  );
}
