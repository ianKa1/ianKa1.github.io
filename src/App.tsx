import { useState } from 'react';
import { Navigation, AmbientBackground } from './components';
import { SectionRouter } from './content/SectionRouter';
import type { Category } from './types';
import './styles/global.css';

function App() {
  const [activeCategory, setActiveCategory] = useState<Category>('entry');
  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null);

  const displayedCategory = hoveredCategory ?? activeCategory;

  return (
    <>
      <AmbientBackground category={displayedCategory} />
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Navigation
          activeCategory={activeCategory}
          hoveredCategory={hoveredCategory}
          onCategoryClick={setActiveCategory}
          onCategoryHover={setHoveredCategory}
        />
        <SectionRouter activeCategory={activeCategory} />
      </div>
    </>
  );
}

export default App;
