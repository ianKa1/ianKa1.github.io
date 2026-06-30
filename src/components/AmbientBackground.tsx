import { motion } from 'motion/react';
import type { Category } from '../types';
import styles from './AmbientBackground.module.css';

interface AmbientBackgroundProps {
  category: Category;
}

const gradientMap: Record<Category, string> = {
  entry: 'linear-gradient(135deg, var(--bg-base) 0%, var(--entry-cream) 100%)',
  systems: 'linear-gradient(135deg, var(--bg-base) 0%, color-mix(in srgb, var(--systems-blue) 15%, var(--bg-base)) 100%)',
  words: 'linear-gradient(135deg, var(--bg-base) 0%, color-mix(in srgb, var(--words-red) 15%, var(--bg-base)) 100%)',
  visuals: 'linear-gradient(135deg, var(--bg-base) 0%, color-mix(in srgb, var(--visuals-pink) 15%, var(--bg-base)) 100%)',
};

const shapeColorMap: Record<Category, string> = {
  entry: 'var(--entry-warm)',
  systems: 'var(--systems-blue)',
  words: 'var(--words-red)',
  visuals: 'var(--visuals-pink)',
};

export function AmbientBackground({ category }: AmbientBackgroundProps) {
  return (
    <>
      <motion.div
        className={styles.gradient}
        animate={{ background: gradientMap[category] }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      />
      <div className={styles.noise} />
      <motion.div
        className={styles.shape}
        animate={{ backgroundColor: shapeColorMap[category] }}
        transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
      />
    </>
  );
}
