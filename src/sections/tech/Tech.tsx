import { AnimatePresence } from 'motion/react';
import { projects, type Project } from '../../data/projects';
import { SectionShell } from '../../content/SectionShell';
import sectionStyles from '../../content/SectionShell.module.css';
import { ProjectGrid } from './ProjectGrid';
import { ProjectDetail } from './ProjectDetail';

interface TechProps {
  /** ID of the open project, or undefined to show the grid. Comes from URL. */
  projectId: string | undefined;
  onSelectProject: (projectId: string) => void;
  onBack: () => void;
}

/**
 * Tech section: URL-driven. The parent (`SectionRouter`) reads the
 * project id out of the hash and passes it in; this component turns it
 * back into a project via `projects.find` and gracefully falls back to
 * the grid when the id doesn't match anything (stale bookmark).
 */
export function Tech({ projectId, onSelectProject, onBack }: TechProps) {
  const selectedProject: Project | undefined = projectId
    ? projects.find((p) => p.id === projectId)
    : undefined;

  return (
    <AnimatePresence mode="wait">
      {selectedProject ? (
        <SectionShell
          key={`tech:${selectedProject.id}`}
          id={`tech:${selectedProject.id}`}
          category="tech"
        >
          <ProjectDetail project={selectedProject} onBack={onBack} />
        </SectionShell>
      ) : (
        <SectionShell key="tech:grid" id="tech" category="tech">
          <h1 className={sectionStyles.title}>Tech</h1>
          <p className={sectionStyles.text}>
            The craft of building software — architecture, products, tools,
            and the philosophy behind technical decisions. Code as a medium
            for thought.
          </p>
          <ProjectGrid
            projects={projects}
            onProjectClick={(project) => onSelectProject(project.id)}
          />
        </SectionShell>
      )}
    </AnimatePresence>
  );
}
