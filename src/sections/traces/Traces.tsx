import { useCallback, useRef, useState } from 'react';
import { places, placeGroups, type Place } from '../../data/places';
import { SectionShell } from '../../content/SectionShell';
import sectionStyles from '../../content/SectionShell.module.css';
import { PlacesMap, type PlacesMapApi } from './PlacesMap';
import { PlacesList } from './PlacesList';
import styles from './Traces.module.css';

/**
 * Traces section: composes the map and the sidebar place list. Owns the
 * shared `activePlace` cursor and holds a ref to the map's imperative
 * fly-to API so the list can drive the camera without importing maplibre.
 */
export function Traces() {
  const [activePlace, setActivePlace] = useState<Place | null>(null);
  const mapApi = useRef<PlacesMapApi | null>(null);

  const handleMapReady = useCallback((api: PlacesMapApi) => {
    mapApi.current = api;
  }, []);

  const handleSelect = (place: Place) => {
    setActivePlace(place);
    mapApi.current?.flyTo(place);
  };

  const handleReset = () => {
    setActivePlace(null);
    mapApi.current?.resetView();
  };

  return (
    <SectionShell id="traces" category="traces">
      <h1 className={sectionStyles.title}>Traces</h1>
      <p className={sectionStyles.text}>
        Places I've inhabited, however briefly. Each mark on the map
        is a chapter read in the language of a city.
      </p>
      <div className={styles.container}>
        <PlacesMap
          places={places}
          activePlace={activePlace}
          onActivePlaceChange={setActivePlace}
          onMapReady={handleMapReady}
        />
        <PlacesList
          groups={placeGroups}
          activePlace={activePlace}
          onSelect={handleSelect}
          onReset={handleReset}
        />
      </div>
    </SectionShell>
  );
}
