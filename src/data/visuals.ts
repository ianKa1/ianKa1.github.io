/**
 * Curated visual works shown in the Visuals gallery.
 *
 * Media type is auto-detected from the file extension by the Gallery
 * component, so entries only need `src` and `alt` in most cases. Set
 * `type` explicitly to override detection (e.g. a `.gif` you want
 * treated as video, or a query-string URL without an extension).
 */
export interface VisualItem {
  src: string;
  alt: string;
  caption?: string;
  type?: 'image' | 'video';
}

export const visuals: VisualItem[] = [
  { src: '/images/visuals/iankai_A_person_approach_the_end_of_universe._Make_the_general__4053deaa-927a-4ee6-9c95-b9d0fa399034.png', alt: 'End of universe' },
  { src: '/images/visuals/iankai_a_wolf_in_the_wilderness_--seed_3385666319_--sref_8121_23704ba8-3cc4-4660-aac5-72cfbf1ab67d_1.png', alt: 'Wolf in wilderness' },
  { src: '/images/visuals/2379d1fa-7da6-4d6c-9212-e15a21a3ab55.png', alt: 'Artwork' },
  { src: '/images/visuals/ChatGPT Image May 1, 2026, 06_58_44 PM.png', alt: 'Generated image' },
  { src: '/images/visuals/4bc612400cedbe514f4865da63ceefbd.jpg', alt: 'Visual' },
  { src: '/images/visuals/fe8352fd72d720f3dd213a9744df73ed.jpg', alt: 'Visual' },
  { src: '/images/visuals/2523d3b275a416f8e5a067f1645e3fe0.mp4', alt: 'Motion study' },
];
