import { AnimatePresence } from 'motion/react';
import { Entry } from '../sections/entry/Entry';
import { Systems } from '../sections/systems/Systems';
import { Words } from '../sections/words/Words';
import { Visuals } from '../sections/visuals/Visuals';
import { Traces } from '../sections/traces/Traces';
import type { RouteState } from '../routing';
import styles from './SectionRouter.module.css';

interface SectionRouterProps {
  route: RouteState;
  navigate: (next: RouteState) => void;
}

/**
 * Pure switch on the active category. Sections that own sub-views
 * (Systems, Words, Traces) receive slugs from the route and a `navigate`
 * function so they can update the URL when the user drills in or
 * backs out.
 */
export function SectionRouter({ route, navigate }: SectionRouterProps) {
  const { category } = route;
  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <AnimatePresence mode="wait">
          {category === 'entry' && <Entry key="entry" />}
          {category === 'systems' && (
            <Systems
              key="systems"
              projectId={route.projectId}
              onSelectProject={(projectId) => navigate({ category: 'systems', projectId })}
              onBack={() => navigate({ category: 'systems' })}
            />
          )}
          {category === 'words' && (
            <Words
              key="words"
              articleSlug={route.articleSlug}
              onSelectArticle={(articleSlug) => navigate({ category: 'words', articleSlug })}
              onBack={() => navigate({ category: 'words' })}
            />
          )}
          {category === 'visuals' && <Visuals key="visuals" />}
          {category === 'traces' && (
            <Traces
              key="traces"
              placeSlug={route.placeSlug}
              onSelectPlace={(placeSlug) => navigate({ category: 'traces', placeSlug })}
              onResetPlace={() => navigate({ category: 'traces' })}
            />
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
