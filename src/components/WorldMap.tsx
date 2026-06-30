import { memo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from 'react-simple-maps';
import { motion } from 'motion/react';
import styles from './WorldMap.module.css';

// Use Natural Earth's low-res world map
const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

export interface Place {
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
  visited?: string;
}

interface WorldMapProps {
  variant: 'ink' | 'constellation' | 'watercolor';
  places: Place[];
  title?: string;
}

const MapChart = memo(function MapChart({ variant, places }: { variant: string; places: Place[] }) {
  const getMapStyles = () => {
    switch (variant) {
      case 'ink':
        return {
          default: { fill: '#2a2a2a', stroke: '#3a3a3a', strokeWidth: 0.5 },
          hover: { fill: '#3a3a3a', stroke: '#4a4a4a', strokeWidth: 0.5 },
          pressed: { fill: '#3a3a3a' },
        };
      case 'constellation':
        return {
          default: { fill: '#15151f', stroke: '#2a2a3f', strokeWidth: 0.3 },
          hover: { fill: '#1a1a2a', stroke: '#3a3a4f', strokeWidth: 0.3 },
          pressed: { fill: '#1a1a2a' },
        };
      case 'watercolor':
      default:
        return {
          default: { fill: '#f5f0e8', stroke: '#d0c8b8', strokeWidth: 0.5 },
          hover: { fill: '#ebe5da', stroke: '#c0b8a8', strokeWidth: 0.5 },
          pressed: { fill: '#ebe5da' },
        };
    }
  };

  const getMarkerColor = () => {
    switch (variant) {
      case 'ink':
        return '#F4C465';
      case 'constellation':
        return '#FFFEF8';
      case 'watercolor':
      default:
        return '#C45C5C';
    }
  };

  const getGlowColor = () => {
    switch (variant) {
      case 'ink':
        return 'rgba(244, 196, 101, 0.4)';
      case 'constellation':
        return 'rgba(255, 254, 248, 0.3)';
      case 'watercolor':
      default:
        return 'rgba(196, 92, 92, 0.3)';
    }
  };

  const mapStyles = getMapStyles();

  return (
    <ComposableMap
      projection="geoMercator"
      projectionConfig={{
        scale: 120,
        center: [0, 30],
      }}
      style={{ width: '100%', height: 'auto' }}
    >
      <Geographies geography={GEO_URL}>
        {({ geographies }) =>
          geographies.map((geo) => (
            <Geography
              key={geo.rsmKey}
              geography={geo}
              style={mapStyles}
            />
          ))
        }
      </Geographies>

      {places.map((place, i) => (
        <Marker key={place.name} coordinates={place.coordinates}>
          {/* Glow */}
          <motion.circle
            r={12}
            fill={getGlowColor()}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0.5, 0.8, 0.5],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 3,
              delay: i * 0.15,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          {/* Core dot */}
          <motion.circle
            r={4}
            fill={getMarkerColor()}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              delay: i * 0.1,
              type: 'spring',
              stiffness: 200,
            }}
          />
          {/* Label */}
          <motion.text
            textAnchor="middle"
            y={-16}
            className={styles.markerLabel}
            data-variant={variant}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 + 0.2 }}
          >
            {place.name}
          </motion.text>
        </Marker>
      ))}
    </ComposableMap>
  );
});

export function WorldMap({ variant, places, title }: WorldMapProps) {
  return (
    <div className={`${styles.container} ${styles[variant]}`}>
      {title && <h3 className={styles.variantTitle}>{title}</h3>}
      <div className={styles.mapWrapper}>
        <MapChart variant={variant} places={places} />
      </div>
    </div>
  );
}
