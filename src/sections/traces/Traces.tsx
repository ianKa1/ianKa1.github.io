import { useCallback, useEffect, useRef } from 'react';
import { places, placeGroups, type Place } from '../../data/places';
import { SectionShell } from '../../content/SectionShell';
import sectionStyles from '../../content/SectionShell.module.css';
import { PlacesMap, type PlacesMapApi } from './PlacesMap';
import { PlacesList } from './PlacesList';
import styles from './Traces.module.css';

interface TracesProps {
  /** Slug of the active place, or undefined for the default map view. */
  placeSlug: string | undefined;
  onSelectPlace: (slug: string) => void;
  onResetPlace: () => void;
}

/**
 * Traces section: composes the map and the sidebar place list. The
 * active place is now URL-driven; this component looks it up by slug,
 * dispatches map fly-tos via a ref, and reports selection changes back
 * to the router.
 */
export function Traces({ placeSlug, onSelectPlace, onResetPlace }: TracesProps) {
  const activePlace: Place | null = placeSlug
    ? places.find((p) => p.slug === placeSlug) ?? null
    : null;
  const mapApi = useRef<PlacesMapApi | null>(null);

  const handleMapReady = useCallback((api: PlacesMapApi) => {
    mapApi.current = api;
    // If we mounted with a slug already in the URL (e.g. a refresh on
    // `#/traces/paris`), fly to the corresponding place as soon as the
    // map hands us its imperative API.
    if (activePlace) {
      api.flyTo(activePlace);
    }
  }, [activePlace]);

  // When the URL slug changes (back/forward, deep link), sync the map
  // camera. Skips the initial mount — that case is handled inside
  // `handleMapReady` once the map instance actually exists.
  const didMount = useRef(false);
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    if (activePlace) {
      mapApi.current?.flyTo(activePlace);
    } else {
      mapApi.current?.resetView();
    }
  }, [activePlace]);

  const handleSelect = (place: Place) => {
    onSelectPlace(place.slug);
  };

  const handleReset = () => {
    onResetPlace();
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
          onActivePlaceChange={(place) =>
            place ? onSelectPlace(place.slug) : onResetPlace()
          }
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
