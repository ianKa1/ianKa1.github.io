import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { projects, type Project } from '../../data/projects';
import { SectionShell } from '../../content/SectionShell';
import sectionStyles from '../../content/SectionShell.module.css';
import { ProjectGrid } from './ProjectGrid';
import { ProjectDetail } from './ProjectDetail';

/**
 * Systems section: owns the currently open project. Uses a nested
 * AnimatePresence so grid ↔ detail transitions animate independently
 * of the outer section fade.
 */
export function Systems() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <AnimatePresence mode="wait">
      {selectedProject ? (
        <SectionShell
          key={`systems:${selectedProject.id}`}
          id={`systems:${selectedProject.id}`}
          category="systems"
        >
          <ProjectDetail
            project={selectedProject}
            onBack={() => setSelectedProject(null)}
          />
        </SectionShell>
      ) : (
        <SectionShell key="systems:grid" id="systems" category="systems">
          <h1 className={sectionStyles.title}>Systems</h1>
          <p className={sectionStyles.text}>
            The craft of building software — architecture, products, tools,
            and the philosophy behind technical decisions. Code as a medium
            for thought.
          </p>
          <ProjectGrid projects={projects} onProjectClick={setSelectedProject} />
        </SectionShell>
      )}
    </AnimatePresence>
  );
}
