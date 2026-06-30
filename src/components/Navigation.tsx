import { motion } from 'motion/react';
import type { Category } from '../types';
import { CATEGORIES } from '../types';
import styles from './Navigation.module.css';

interface NavigationProps {
  activeCategory: Category;
  hoveredCategory: Category | null;
  onCategoryClick: (category: Category) => void;
  onCategoryHover: (category: Category | null) => void;
}

export function Navigation({
  activeCategory,
  hoveredCategory,
  onCategoryClick,
  onCategoryHover,
}: NavigationProps) {
  return (
    <nav className={styles.nav}>
      <div className={styles.header}>
        <motion.div
          className={styles.name}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          
        </motion.div>
        <motion.div
          className={styles.tagline}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Maker of things
        </motion.div>
      </div>

      <div className={styles.categories}>
        {CATEGORIES.map((category, index) => (
          <motion.div
            key={category.id}
            className={`${styles.item} ${activeCategory === category.id ? styles.active : ''}`}
            data-category={category.id}
            onClick={() => onCategoryClick(category.id)}
            onMouseEnter={() => onCategoryHover(category.id)}
            onMouseLeave={() => onCategoryHover(null)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + index * 0.08 }}
          >
            <span className={styles.number}>{category.number}</span>
            <span className={styles.label}>{category.label}</span>
            <motion.span
              className={styles.accent}
              initial={{ width: 0 }}
              animate={{
                width: activeCategory === category.id || hoveredCategory === category.id ? '100%' : 0,
              }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            />
          </motion.div>
        ))}
      </div>

      <motion.div
        className={styles.footer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div className={styles.links}>
          <a href="mailto:iankai0v0@gmail.com" className={styles.link}>
            Email
          </a>
          <a href="https://github.com/ianka1" className={styles.link}>
            GitHub
          </a>
          <a href="https://www.linkedin.com/in/kaiymao" className={styles.link}>
            LinkedIn
          </a>
        </div>
      </motion.div>
    </nav>
  );
}
