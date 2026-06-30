import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import styles from './Gallery.module.css';

export interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
}

interface GalleryProps {
  images: GalleryImage[];
}

export function Gallery({ images }: GalleryProps) {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  if (images.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No images yet. Add images to <code>/public/images/visuals/</code></p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.grid}>
        {images.map((image, index) => (
          <motion.button
            key={image.src}
            className={styles.item}
            onClick={() => setSelectedImage(image)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <img
              src={image.src}
              alt={image.alt}
              className={styles.image}
              loading="lazy"
            />
            {image.caption && (
              <span className={styles.caption}>{image.caption}</span>
            )}
          </motion.button>
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
              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                className={styles.lightboxImage}
              />
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
