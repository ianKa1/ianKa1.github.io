import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import type { Project } from '../../data/projects';
import styles from './ProjectDetail.module.css';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
}

const remarkPlugins = [remarkMath];
const rehypePlugins = [rehypeKatex];

export function ProjectDetail({ project, onBack }: ProjectDetailProps) {
  return (
    <motion.article
      className={styles.detail}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.button
        className={styles.backButton}
        onClick={onBack}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        whileHover={{ x: -4 }}
      >
        <span className={styles.arrow}>&larr;</span>
        <span>Back to projects</span>
      </motion.button>

      <motion.header
        className={styles.header}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <div className={styles.meta}>
          {project.year && <span className={styles.year}>{project.year}</span>}
          {project.tags?.map((tag) => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>
        <h1 className={styles.title}>{project.title}</h1>
        {project.subtitle && (
          <p className={styles.subtitle}>{project.subtitle}</p>
        )}
      </motion.header>

      <motion.div
        className={styles.hero}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        {project.thumbnailType === 'video' ? (
          <video
            src={project.thumbnail}
            className={styles.heroMedia}
            controls
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <img
            src={project.thumbnail}
            alt={project.title}
            className={styles.heroMedia}
          />
        )}
      </motion.div>

      <motion.div
        className={styles.content}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {project.sections.map((section) => (
          <section key={section.heading} className={styles.section}>
            <h2 className={styles.sectionTitle}>{section.heading}</h2>
            <div className={styles.markdown}>
              <ReactMarkdown
                remarkPlugins={remarkPlugins}
                rehypePlugins={rehypePlugins}
              >
                {section.body}
              </ReactMarkdown>
            </div>
          </section>
        ))}
      </motion.div>
    </motion.article>
  );
}
