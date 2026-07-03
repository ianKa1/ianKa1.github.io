import { SectionShell } from '../../content/SectionShell';
import sectionStyles from '../../content/SectionShell.module.css';
import styles from './Entry.module.css';
import { entryContent } from '../../data/entry';

export function Entry() {
  return (
    <SectionShell id="entry" category="entry">
      <div className={styles.layout}>
      <p className={sectionStyles.greeting}>Welcome, stranger.</p>
      <h1 className={sectionStyles.title}>
        Things I've built,<br />read, and <em>wondered</em> about
      </h1>

      {/* Motto — a wall card. On wide screens it hangs in the margin
          right of the column; on medium screens it floats inside the
          column and the bio wraps around it. Always above the fold. */}
      <aside className={styles.mottoSlot}>
        <div className={styles.mottoCard}>
          <p className={styles.mottoText}>{entryContent.motto}</p>
        </div>
      </aside>

      {entryContent.bio.map((paragraph) => (
        <p key={paragraph.slice(0, 24)} className={sectionStyles.text}>
          {paragraph}
        </p>
      ))}

      {/* Motivation — its own paragraph, same voice as the bio. */}
      <p className={sectionStyles.text}>{entryContent.motivation}</p>

      {/* Favorites — set like object labels in a gallery catalog. */}
      <p className={styles.favoritesIntro}>{entryContent.favoritesIntro}</p>
      <dl className={styles.favorites}>
        {entryContent.favorites.map(({ label, value }) => (
          <div key={label} className={styles.favoriteRow}>
            <dt className={styles.favoriteLabel}>{label}</dt>
            <dd className={styles.favoriteValue}>{value}</dd>
          </div>
        ))}
      </dl>
      </div>
    </SectionShell>
  );
}
