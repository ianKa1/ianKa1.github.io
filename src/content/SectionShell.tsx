import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import type { Category } from '../types';
import styles from './SectionShell.module.css';

interface SectionShellProps {
  /** Drives the section's accent styling and animation key. */
  id: Category | `${Category}:${string}`;
  /** The active category — used for the `data-section` accent hook.
   *  Written separately from `id` so Systems can swap keys between the
   *  grid and detail views without losing its accent color. */
  category: Category;
  children: ReactNode;
}

const sectionVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

/**
 * Common outer shell for every top-level section. Owns the entrance/exit
 * animation, the shared display width, and the `data-section` accent hook
 * that drives per-category title color in the stylesheet.
 */
export function SectionShell({ id, category, children }: SectionShellProps) {
  return (
    <motion.section
      key={id}
      className={styles.section}
      data-section={category}
      variants={sectionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.section>
  );
}
