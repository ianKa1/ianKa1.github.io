import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import type { Project } from '../types';
import styles from './ProjectCard.module.css';

interface ProjectCardProps {
  project: Project;
  index: number;
  onClick: () => void;
}

export function ProjectCard({ project, index, onClick }: ProjectCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <motion.article
      className={styles.card}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={styles.thumbnail}>
        {project.thumbnailType === 'video' ? (
          <video
            ref={videoRef}
            src={project.thumbnail}
            className={styles.media}
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : (
          <img
            src={project.thumbnail}
            alt={project.title}
            className={styles.media}
            loading="lazy"
          />
        )}
        <div className={styles.overlay} data-hovered={isHovered} />
        <motion.div
          className={styles.viewIndicator}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
          transition={{ duration: 0.2 }}
        >
          <span>View</span>
        </motion.div>
      </div>

      <div className={styles.info}>
        <div className={styles.meta}>
          {project.year && <span className={styles.year}>{project.year}</span>}
          {project.tags && project.tags.length > 0 && (
            <span className={styles.tag}>{project.tags[0]}</span>
          )}
        </div>
        <h3 className={styles.title}>{project.title}</h3>
        {project.subtitle && (
          <p className={styles.subtitle}>{project.subtitle}</p>
        )}
      </div>
    </motion.article>
  );
}
