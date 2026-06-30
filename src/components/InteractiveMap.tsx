import { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { motion, AnimatePresence } from 'motion/react';
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import styles from './InteractiveMap.module.css';

export interface Place {
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
  type: 'lived' | 'traveled';
  visited?: string;
  note?: string;
  // Optional admin boundary polygon (city/district) used to shade the area
  // on the map. Populated by `scripts/geocode.mjs` from Nominatim.
  boundary?: Polygon | MultiPolygon;
}

interface InteractiveMapProps {
  places: Place[];
}

// Editorial Atelier map style - warm, muted, elegant.
// CartoDB "light_all" tiles: free, no API key, served over HTTPS, English labels.
const editorialMapStyle: maplibregl.StyleSpecification = {
  version: 8,
  name: 'Editorial Atelier',
  sources: {
    'carto': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
        'https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
      ],
      tileSize: 256,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    },
  },
  layers: [
    {
      id: 'carto-layer',
      type: 'raster',
      source: 'carto',
      minzoom: 0,
      maxzoom: 20,
      paint: {
        'raster-saturation': -0.2,
        'raster-brightness-min': 0.05,
        'raster-brightness-max': 0.95,
        'raster-hue-rotate': 20, // Warm shift toward the editorial palette
      },
    },
  ],
  glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
};

// City boundary fill colors — keyed by Place.type.
const BOUNDARY_COLORS = {
  lived: 'rgba(26, 22, 18, 0.25)',      // Dark ink with transparency
  traveled: 'rgba(120, 112, 100, 0.18)', // Warm grey with transparency
};

export function InteractiveMap({ places }: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [activePlace, setActivePlace] = useState<Place | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: editorialMapStyle,
      center: [104, 35], // Center on China
      zoom: 3,
      minZoom: 1,
      maxZoom: 12,
      attributionControl: false,
      pitchWithRotate: false,
      dragRotate: false,
    });

    map.current.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      'bottom-right'
    );

    map.current.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      'top-right'
    );

    map.current.on('load', () => {
      setIsLoaded(true);
    });

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Render per-city boundary polygons. Each place carries its own (already
  // simplified) GeoJSON polygon in `place.boundary`, baked into the cache by
  // `scripts/geocode.mjs`. We turn the array into a single FeatureCollection
  // and use a `type` property + filter to drive lived/traveled styling.
  useEffect(() => {
    if (!map.current || !isLoaded) return;
    const m = map.current;

    const features = places
      .filter((p): p is Place & { boundary: NonNullable<Place['boundary']> } => Boolean(p.boundary))
      .map<Feature>((p) => ({
        type: 'Feature',
        properties: { name: p.name, kind: p.type },
        geometry: p.boundary,
      }));

    const data: FeatureCollection = { type: 'FeatureCollection', features };

    const existing = m.getSource('place-boundaries') as maplibregl.GeoJSONSource | undefined;
    if (existing) {
      existing.setData(data);
      return;
    }

    m.addSource('place-boundaries', { type: 'geojson', data });

    m.addLayer({
      id: 'boundaries-lived-fill',
      type: 'fill',
      source: 'place-boundaries',
      paint: { 'fill-color': BOUNDARY_COLORS.lived },
      filter: ['==', ['get', 'kind'], 'lived'],
    });
    m.addLayer({
      id: 'boundaries-lived-border',
      type: 'line',
      source: 'place-boundaries',
      paint: {
        'line-color': 'rgba(26, 22, 18, 0.5)',
        'line-width': 1.2,
      },
      filter: ['==', ['get', 'kind'], 'lived'],
    });

    m.addLayer({
      id: 'boundaries-traveled-fill',
      type: 'fill',
      source: 'place-boundaries',
      paint: { 'fill-color': BOUNDARY_COLORS.traveled },
      filter: ['==', ['get', 'kind'], 'traveled'],
    });
    m.addLayer({
      id: 'boundaries-traveled-border',
      type: 'line',
      source: 'place-boundaries',
      paint: {
        'line-color': 'rgba(120, 112, 100, 0.4)',
        'line-width': 1,
      },
      filter: ['==', ['get', 'kind'], 'traveled'],
    });
  }, [places, isLoaded]);

  // Add markers when map is loaded
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers with staggered animation
    places.forEach((place, index) => {
      const el = document.createElement('div');
      el.className = styles.marker;
      el.setAttribute('data-type', place.type);
      el.style.animationDelay = `${index * 0.15}s`;

      // Inner glow element
      const glow = document.createElement('div');
      glow.className = place.type === 'lived' ? styles.markerGlowLived : styles.markerGlowTraveled;
      el.appendChild(glow);

      // Core dot
      const dot = document.createElement('div');
      dot.className = place.type === 'lived' ? styles.markerDotLived : styles.markerDotTraveled;
      el.appendChild(dot);

      el.addEventListener('mouseenter', () => setActivePlace(place));
      el.addEventListener('mouseleave', () => setActivePlace(null));
      el.addEventListener('click', () => {
        map.current?.flyTo({
          center: place.coordinates,
          zoom: 6,
          duration: 1500,
          essential: true,
        });
      });

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat(place.coordinates)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [places, isLoaded]);

  // Fly to active place
  const handlePlaceClick = (place: Place) => {
    setActivePlace(place);
    map.current?.flyTo({
      center: place.coordinates,
      zoom: 6,
      duration: 1500,
      essential: true,
    });
  };

  const handleResetView = () => {
    setActivePlace(null);
    map.current?.flyTo({
      center: [20, 30],
      zoom: 1.5,
      duration: 1200,
      essential: true,
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.mapWrapper}>
        <div ref={mapContainer} className={styles.map} />

        {/* Loading overlay */}
        <AnimatePresence>
          {!isLoaded && (
            <motion.div
              className={styles.loadingOverlay}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className={styles.loadingText}>Loading map...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active place tooltip */}
        <AnimatePresence>
          {activePlace && (
            <motion.div
              className={styles.tooltip}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <span className={styles.tooltipName}>{activePlace.name}</span>
              <span className={`${styles.tooltipType} ${activePlace.type === 'lived' ? styles.tooltipTypeLived : styles.tooltipTypeTraveled}`}>
                {activePlace.type === 'lived' ? 'Lived' : 'Traveled'}
              </span>
              {activePlace.visited && (
                <span className={styles.tooltipYear}>{activePlace.visited}</span>
              )}
              {activePlace.note && (
                <span className={styles.tooltipNote}>{activePlace.note}</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Place list */}
      <div className={styles.placeList}>
        <div className={styles.placeListHeader}>
          <span className={styles.placeListTitle}>Places</span>
          <button className={styles.resetButton} onClick={handleResetView}>
            Reset view
          </button>
        </div>
        <ul className={styles.places}>
          {places.map((place, index) => (
            <motion.li
              key={place.name}
              className={`${styles.placeItem} ${activePlace?.name === place.name ? styles.placeItemActive : ''}`}
              data-type={place.type}
              onClick={() => handlePlaceClick(place)}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <span className={`${styles.placeIndicator} ${place.type === 'lived' ? styles.placeIndicatorLived : styles.placeIndicatorTraveled}`} />
              <span className={styles.placeName}>{place.name}</span>
              {place.visited && (
                <span className={styles.placeYear}>{place.visited}</span>
              )}
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}
