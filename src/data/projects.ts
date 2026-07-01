/**
 * Systems projects — long-form work shown in the Systems section.
 *
 * The thumbnail can be either an image or a video; `thumbnailType`
 * selects the renderer used by the grid card and detail hero.
 */
export interface Project {
  id: string;
  title: string;
  subtitle?: string;
  thumbnail: string;
  thumbnailType: 'image' | 'video';
  year?: string;
  tags?: string[];
}

export const projects: Project[] = [
  {
    id: 'project-1',
    title: 'Project One',
    subtitle: 'Description placeholder',
    thumbnail: '/images/systems/0c365d65c69866cb6f8f53ed6a88760b.mp4',
    thumbnailType: 'video',
    year: '2024',
    tags: ['Demo'],
  },
  {
    id: 'project-2',
    title: 'Project Two',
    subtitle: 'Description placeholder',
    thumbnail: '/images/systems/1e0c6713b31ff4a95efc543da544b254.mp4',
    thumbnailType: 'video',
    year: '2024',
    tags: ['Demo'],
  },
  {
    id: 'project-3',
    title: 'Project Three',
    subtitle: 'Description placeholder',
    thumbnail: '/images/systems/a233f8faf96427ef35dc57962faae2b6.mp4',
    thumbnailType: 'video',
    year: '2024',
    tags: ['Demo'],
  },
];
