import { motion } from 'motion/react';
import type { Place, PlaceGroup } from '../../data/places';
import styles from './Traces.module.css';

interface PlacesListProps {
  groups: PlaceGroup[];
  activePlace: Place | null;
  onSelect: (place: Place) => void;
  onReset: () => void;
}

export function PlacesList({ groups, activePlace, onSelect, onReset }: PlacesListProps) {
  // Continues a single stagger index across groups so the entrance animation
  // reads as one sweep, not a restart per section.
  let idx = 0;

  return (
    <div className={styles.placeList}>
      <div className={styles.placeListHeader}>
        <span className={styles.placeListTitle}>Places</span>
        <button className={styles.resetButton} onClick={onReset}>
          Reset view
        </button>
      </div>
      <div className={styles.placeGroups}>
        {groups.map((group) => (
          <section key={group.country} className={styles.placeGroup}>
            <h4 className={styles.placeGroupTitle}>
              <span>{group.country}</span>
              <span className={styles.placeGroupCount}>
                {group.places.length}
              </span>
            </h4>
            <ul className={styles.places}>
              {group.places.map((place) => {
                const i = idx++;
                return (
                  <motion.li
                    key={place.name}
                    className={`${styles.placeItem} ${activePlace?.name === place.name ? styles.placeItemActive : ''}`}
                    data-type={place.type}
                    onClick={() => onSelect(place)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <span className={`${styles.placeIndicator} ${place.type === 'lived' ? styles.placeIndicatorLived : styles.placeIndicatorTraveled}`} />
                    <span className={styles.placeName}>{place.city}</span>
                    {place.visited && (
                      <span className={styles.placeYear}>{place.visited}</span>
                    )}
                  </motion.li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
