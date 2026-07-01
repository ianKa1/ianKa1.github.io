import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Category } from '../types';
import { Gallery } from './Gallery';
import { ProjectGrid } from './ProjectGrid';
import { ProjectDetail } from './ProjectDetail';
import { InteractiveMap } from './InteractiveMap';
import { Words } from './Words';
import { places, placeGroups } from '../data/places';
import { projects, type Project } from '../data/projects';
import { visuals } from '../data/visuals';
import styles from './Content.module.css';

interface ContentProps {
  activeCategory: Category;
}

const contentVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export function Content({ activeCategory }: ContentProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
  };

  const handleBackToGrid = () => {
    setSelectedProject(null);
  };

  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <AnimatePresence mode="wait">
          {activeCategory === 'entry' && (
            <motion.section
              key="entry"
              className={styles.section}
              data-section="entry"
              variants={contentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
              <p className={styles.greeting}>Welcome, stranger.</p>
              <h1 className={styles.title}>
                I build things<br />& wonder about <em>everything</em>
              </h1>
              <p className={styles.text}>
                I'm a programmer who reads too much philosophy, paints occasionally,
                and believes that code and art share the same root: making order from chaos,
                then questioning that order.
              </p>
              <p className={styles.text}>
                This is a space where technical systems meet human stories.
                Navigate left to explore what I've been thinking about, building,
                and collecting along the way.
              </p>
            </motion.section>
          )}

          {activeCategory === 'systems' && !selectedProject && (
            <motion.section
              key="systems"
              className={styles.section}
              data-section="systems"
              variants={contentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
              <h1 className={styles.title}>Systems</h1>
              <p className={styles.text}>
                The craft of building software — architecture, products, tools,
                and the philosophy behind technical decisions. Code as a medium
                for thought.
              </p>
              <ProjectGrid projects={projects} onProjectClick={handleProjectClick} />
            </motion.section>
          )}

          {activeCategory === 'systems' && selectedProject && (
            <motion.section
              key={`project-${selectedProject.id}`}
              className={styles.section}
              data-section="systems"
              variants={contentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
              <ProjectDetail project={selectedProject} onBack={handleBackToGrid} />
            </motion.section>
          )}

          {activeCategory === 'words' && (
            <motion.section
              key="words"
              className={styles.section}
              data-section="words"
              variants={contentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
              <h1 className={styles.title}>Words</h1>
              <p className={styles.text}>
                Reading and writing as parallel acts of attention. Notes on literature,
                philosophy, essays that changed how I see things, and my own attempts
                to articulate ideas.
              </p>
              <Words />
            </motion.section>
          )}

          {activeCategory === 'visuals' && (
            <motion.section
              key="visuals"
              className={styles.section}
              data-section="visuals"
              variants={contentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
              <h1 className={styles.title}>Visuals</h1>
              <p className={styles.text}>
                Images I've made and images I've loved. Paintings, photographs,
                design references, film stills — a collection of things that
                taught my eye something.
              </p>
              <Gallery images={visuals} />
            </motion.section>
          )}

          {activeCategory === 'traces' && (
            <motion.section
              key="traces"
              className={styles.section}
              data-section="traces"
              variants={contentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
              <h1 className={styles.title}>Traces</h1>
              <p className={styles.text}>
                Places I've inhabited, however briefly. Each mark on the map
                is a chapter read in the language of a city.
              </p>
              <InteractiveMap places={places} groups={placeGroups} />
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
