import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { VisualItem } from '../../data/visuals';
import styles from './Gallery.module.css';

interface GalleryProps {
  images: VisualItem[];
}

function isVideoSrc(src: string): boolean {
  return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(src);
}

function resolveType(item: VisualItem): 'image' | 'video' {
  return item.type ?? (isVideoSrc(item.src) ? 'video' : 'image');
}

interface GridItemProps {
  item: VisualItem;
  index: number;
  onSelect: () => void;
}

function GridItem({ item, index, onSelect }: GridItemProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const kind = resolveType(item);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <motion.button
      className={styles.item}
      onClick={onSelect}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {kind === 'video' ? (
        <>
          <video
            ref={videoRef}
            src={item.src}
            className={styles.image}
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={item.alt}
          />
          <span className={styles.videoBadge} aria-hidden="true">▶</span>
        </>
      ) : (
        <img
          src={item.src}
          alt={item.alt}
          className={styles.image}
          loading="lazy"
        />
      )}
      {item.caption && (
        <span className={styles.caption}>{item.caption}</span>
      )}
    </motion.button>
  );
}

export function Gallery({ images }: GalleryProps) {
  const [selectedImage, setSelectedImage] = useState<VisualItem | null>(null);

  if (images.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No images yet. Add images to <code>/public/images/visuals/</code></p>
      </div>
    );
  }

  const selectedKind = selectedImage ? resolveType(selectedImage) : null;

  return (
    <>
      <div className={styles.grid}>
        {images.map((image, index) => (
          <GridItem
            key={image.src}
            item={image}
            index={index}
            onSelect={() => setSelectedImage(image)}
          />
        ))}
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className={styles.lightbox}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              className={styles.lightboxContent}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              {selectedKind === 'video' ? (
                <video
                  src={selectedImage.src}
                  className={styles.lightboxImage}
                  controls
                  autoPlay
                  loop
                  playsInline
                  aria-label={selectedImage.alt}
                />
              ) : (
                <img
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  className={styles.lightboxImage}
                />
              )}
              {selectedImage.caption && (
                <p className={styles.lightboxCaption}>{selectedImage.caption}</p>
              )}
              <button
                className={styles.closeButton}
                onClick={() => setSelectedImage(null)}
                aria-label="Close"
              >
                ×
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
