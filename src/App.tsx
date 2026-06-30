import { useState } from 'react';
import { Navigation, Content, AmbientBackground } from './components';
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
        <Content activeCategory={activeCategory} />
      </div>
    </>
  );
}

export default App;
