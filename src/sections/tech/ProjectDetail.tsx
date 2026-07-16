import { motion } from 'motion/react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import type { Element } from 'hast';
import type { Project } from '../../data/projects';
import { MermaidDiagram } from './MermaidDiagram';
import styles from './ProjectDetail.module.css';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
}

const remarkPlugins = [remarkGfm, remarkMath];
const rehypePlugins = [rehypeKatex];

/* If a fenced code block is ```mermaid, pull its source text out of the
   hast node so the block can be swapped for a rendered diagram. */
function mermaidSource(pre: Element | undefined): string | null {
  const code = pre?.children?.[0];
  if (!code || code.type !== 'element' || code.tagName !== 'code') return null;
  const className = code.properties?.className;
  if (!Array.isArray(className) || !className.includes('language-mermaid')) {
    return null;
  }
  const text = code.children[0];
  return text?.type === 'text' ? text.value : null;
}

const markdownComponents: Components = {
  pre({ node, children, ...props }) {
    const chart = mermaidSource(node);
    if (chart) return <MermaidDiagram chart={chart} />;
    return <pre {...props}>{children}</pre>;
  },
  table({ node: _node, children, ...props }) {
    return (
      <div className={styles.tableWrap}>
        <table {...props}>{children}</table>
      </div>
    );
  },
};

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
                components={markdownComponents}
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
