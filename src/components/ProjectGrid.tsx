import type { Project } from '../types';
import { ProjectCard } from './ProjectCard';
import styles from './ProjectGrid.module.css';

interface ProjectGridProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
}

export function ProjectGrid({ projects, onProjectClick }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No projects yet. Add media to <code>/public/images/systems/</code></p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {projects.map((project, index) => (
        <ProjectCard
          key={project.id}
          project={project}
          index={index}
          onClick={() => onProjectClick(project)}
        />
      ))}
    </div>
  );
}
