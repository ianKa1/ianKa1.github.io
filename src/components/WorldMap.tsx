import { motion } from 'motion/react';
import styles from './WorldMap.module.css';

// Country/region paths for more detailed rendering
const REGIONS = {
  northAmerica: `M 50 80 Q 80 60 120 70 Q 180 50 220 80 Q 260 70 280 100 Q 300 80 320 110 L 300 150 Q 280 180 240 200 Q 200 220 160 200 Q 120 180 100 150 Q 80 120 50 100 Z`,
  southAmerica: `M 200 280 Q 220 260 250 270 Q 280 280 290 320 Q 300 380 280 440 Q 260 500 230 540 Q 200 560 180 520 Q 160 460 170 400 Q 180 340 200 280 Z`,
  europe: `M 420 80 Q 450 70 480 80 Q 520 75 550 90 Q 570 100 560 130 Q 540 150 500 160 Q 460 165 430 150 Q 400 130 410 100 Q 415 85 420 80 Z`,
  africa: `M 420 180 Q 460 170 500 185 Q 540 200 550 250 Q 560 320 540 390 Q 510 450 460 470 Q 410 480 380 440 Q 360 380 370 310 Q 385 240 420 180 Z`,
  asia: `M 560 60 Q 620 50 700 70 Q 780 60 840 90 Q 880 120 860 180 Q 820 240 750 260 Q 680 270 620 250 Q 560 220 540 160 Q 530 100 560 60 Z`,
  oceania: `M 750 340 Q 800 330 850 350 Q 890 380 880 420 Q 860 460 810 470 Q 760 475 730 450 Q 710 410 720 370 Q 735 345 750 340 Z`,
};

export interface Place {
  name: string;
  coordinates: [number, number]; // [x, y] relative to 900x500 viewBox
  visited: string; // year or date
}

interface WorldMapProps {
  variant: 'ink' | 'constellation' | 'watercolor';
  places: Place[];
  title?: string;
}

export function WorldMap({ variant, places, title }: WorldMapProps) {
  return (
    <div className={`${styles.container} ${styles[variant]}`}>
      {title && <h3 className={styles.variantTitle}>{title}</h3>}
      <svg
        viewBox="0 0 900 500"
        className={styles.map}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Ink variant gradients */}
          <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F4C465" stopOpacity="1" />
            <stop offset="50%" stopColor="#D4A445" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#B48425" stopOpacity="0" />
          </radialGradient>

          {/* Constellation variant */}
          <radialGradient id="starGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFEF8" stopOpacity="1" />
            <stop offset="40%" stopColor="#FFF8E8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#F5F0E8" stopOpacity="0" />
          </radialGradient>

          {/* Watercolor filters */}
          <filter id="watercolor" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G" />
            <feGaussianBlur stdDeviation="2" />
          </filter>

          <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Base map rendering based on variant */}
        <g className={styles.regions}>
          {Object.entries(REGIONS).map(([name, path]) => (
            <path
              key={name}
              d={path}
              className={styles.region}
              data-region={name}
            />
          ))}
        </g>

        {/* Connection lines for constellation variant */}
        {variant === 'constellation' && places.length > 1 && (
          <g className={styles.connections}>
            {places.slice(0, -1).map((place, i) => {
              const next = places[i + 1];
              return (
                <motion.line
                  key={`line-${i}`}
                  x1={place.coordinates[0]}
                  y1={place.coordinates[1]}
                  x2={next.coordinates[0]}
                  y2={next.coordinates[1]}
                  className={styles.connectionLine}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.3 }}
                  transition={{ duration: 1.5, delay: i * 0.3 + 0.5 }}
                />
              );
            })}
          </g>
        )}

        {/* Watercolor washes for visited regions */}
        {variant === 'watercolor' && (
          <g className={styles.washes}>
            {places.map((place, i) => (
              <motion.circle
                key={`wash-${place.name}`}
                cx={place.coordinates[0]}
                cy={place.coordinates[1]}
                r="60"
                className={styles.wash}
                filter="url(#watercolor)"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.4, scale: 1 }}
                transition={{ duration: 1.2, delay: i * 0.2 }}
              />
            ))}
          </g>
        )}

        {/* Place markers */}
        <g className={styles.places}>
          {places.map((place, i) => (
            <g key={place.name} className={styles.placeGroup}>
              {/* Glow effect for ink variant */}
              {variant === 'ink' && (
                <motion.circle
                  cx={place.coordinates[0]}
                  cy={place.coordinates[1]}
                  r="20"
                  fill="url(#glowGradient)"
                  className={styles.glow}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0.6, 0.9, 0.6],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 3,
                    delay: i * 0.15,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}

              {/* Star effect for constellation variant */}
              {variant === 'constellation' && (
                <motion.circle
                  cx={place.coordinates[0]}
                  cy={place.coordinates[1]}
                  r="12"
                  fill="url(#starGradient)"
                  filter="url(#softGlow)"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    delay: i * 0.1,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}

              {/* Core dot */}
              <motion.circle
                cx={place.coordinates[0]}
                cy={place.coordinates[1]}
                r={variant === 'constellation' ? 3 : variant === 'watercolor' ? 4 : 5}
                className={styles.dot}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.1,
                  type: "spring",
                  stiffness: 200
                }}
              />

              {/* Label */}
              <motion.text
                x={place.coordinates[0]}
                y={place.coordinates[1] - 28}
                className={styles.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 + 0.3 }}
              >
                {place.name}
              </motion.text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
