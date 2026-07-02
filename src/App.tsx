import { useState, useEffect } from 'react';
import { Navigation, AmbientBackground } from './components';
import { SectionRouter } from './content/SectionRouter';
import { useHashRoute } from './routing';
import { projects } from './data/projects';
import { articles } from './data/articles';
import { places } from './data/places';
import type { Category } from './types';
import './styles/global.css';

function App() {
  const { route, navigate, replace } = useHashRoute();
  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null);

  // Normalize an empty hash on first mount so back/forward always land
  // on a canonical URL (`#/`). Uses replaceState so we don't leave a
  // blank entry in history.
  useEffect(() => {
    if (!window.location.hash) replace({ category: 'entry' });
  }, [replace]);

  // Stale-slug cleanup: if the URL points at a subview that no longer
  // exists (renamed article, deleted project), silently rewrite the URL
  // to the section root. Uses replaceState so back doesn't hop through
  // a broken entry.
  useEffect(() => {
    if (route.projectId && !projects.some((p) => p.id === route.projectId)) {
      replace({ category: 'systems' });
      return;
    }
    if (route.articleSlug && !articles.some((a) => a.slug === route.articleSlug)) {
      replace({ category: 'words' });
      return;
    }
    if (route.placeSlug && !places.some((p) => p.slug === route.placeSlug)) {
      replace({ category: 'traces' });
    }
  }, [route.projectId, route.articleSlug, route.placeSlug, replace]);

  const activeCategory = route.category;
  const displayedCategory = hoveredCategory ?? activeCategory;

  return (
    <>
      <AmbientBackground category={displayedCategory} />
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Navigation
          activeCategory={activeCategory}
          hoveredCategory={hoveredCategory}
          onCategoryClick={(category) => navigate({ category })}
          onCategoryHover={setHoveredCategory}
        />
        <SectionRouter route={route} navigate={navigate} />
      </div>
    </>
  );
}

export default App;
