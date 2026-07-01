import { AnimatePresence } from 'motion/react';
import type { Category } from '../types';
import { Entry } from '../sections/entry/Entry';
import { Systems } from '../sections/systems/Systems';
import { Words } from '../sections/words/Words';
import { Visuals } from '../sections/visuals/Visuals';
import { Traces } from '../sections/traces/Traces';
import styles from './SectionRouter.module.css';

interface SectionRouterProps {
  activeCategory: Category;
}

/**
 * Pure switch on the active category. Each section owns its own state,
 * heading, intro copy, and enter/exit animation via SectionShell. The
 * outer AnimatePresence drives the fade between sections.
 */
export function SectionRouter({ activeCategory }: SectionRouterProps) {
  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <AnimatePresence mode="wait">
          {activeCategory === 'entry' && <Entry key="entry" />}
          {activeCategory === 'systems' && <Systems key="systems" />}
          {activeCategory === 'words' && <Words key="words" />}
          {activeCategory === 'visuals' && <Visuals key="visuals" />}
          {activeCategory === 'traces' && <Traces key="traces" />}
        </AnimatePresence>
      </div>
    </main>
  );
}
