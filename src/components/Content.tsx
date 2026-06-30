import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Category, Project } from '../types';
import { Gallery, type GalleryImage } from './Gallery';
import { ProjectGrid } from './ProjectGrid';
import { ProjectDetail } from './ProjectDetail';
import { WorldMap, type Place } from './WorldMap';
import styles from './Content.module.css';

// Sample places for the map demo - replace with your actual places
// Coordinates are [longitude, latitude]
const samplePlaces: Place[] = [
  { name: 'Tokyo', coordinates: [139.6917, 35.6895], visited: '2023' },
  { name: 'Paris', coordinates: [2.3522, 48.8566], visited: '2022' },
  { name: 'New York', coordinates: [-74.006, 40.7128], visited: '2021' },
  { name: 'Sydney', coordinates: [151.2093, -33.8688], visited: '2020' },
  { name: 'London', coordinates: [-0.1276, 51.5074], visited: '2019' },
];

// Gallery images
const galleryImages: GalleryImage[] = [
  { src: '/images/visuals/iankai_A_person_approach_the_end_of_universe._Make_the_general__4053deaa-927a-4ee6-9c95-b9d0fa399034.png', alt: 'End of universe' },
  { src: '/images/visuals/iankai_a_wolf_in_the_wilderness_--seed_3385666319_--sref_8121_23704ba8-3cc4-4660-aac5-72cfbf1ab67d_1.png', alt: 'Wolf in wilderness' },
  { src: '/images/visuals/2379d1fa-7da6-4d6c-9212-e15a21a3ab55.png', alt: 'Artwork' },
  { src: '/images/visuals/ChatGPT Image May 1, 2026, 06_58_44 PM.png', alt: 'Generated image' },
  { src: '/images/visuals/4bc612400cedbe514f4865da63ceefbd.jpg', alt: 'Visual' },
  { src: '/images/visuals/fe8352fd72d720f3dd213a9744df73ed.jpg', alt: 'Visual' },
];

// Projects for Systems section
const projects: Project[] = [
  {
    id: 'project-1',
    title: 'Project One',
    subtitle: 'Description placeholder',
    thumbnail: '/images/systems/0c365d65c69866cb6f8f53ed6a88760b.mp4',
    thumbnailType: 'video',
    year: '2024',
    tags: ['Demo'],
  },
  {
    id: 'project-2',
    title: 'Project Two',
    subtitle: 'Description placeholder',
    thumbnail: '/images/systems/1e0c6713b31ff4a95efc543da544b254.mp4',
    thumbnailType: 'video',
    year: '2024',
    tags: ['Demo'],
  },
  {
    id: 'project-3',
    title: 'Project Three',
    subtitle: 'Description placeholder',
    thumbnail: '/images/systems/a233f8faf96427ef35dc57962faae2b6.mp4',
    thumbnailType: 'video',
    year: '2024',
    tags: ['Demo'],
  },
];

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
              <p className={styles.text}>
                Currently reading widely across fiction, critical theory,
                and whatever catches my attention in the margins.
              </p>
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
              <Gallery images={galleryImages} />
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
              <div className={styles.mapVariants}>
                <WorldMap variant="ink" places={samplePlaces} title="Ink & Parchment" />
                <WorldMap variant="constellation" places={samplePlaces} title="Constellation" />
                <WorldMap variant="watercolor" places={samplePlaces} title="Watercolor Wash" />
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
