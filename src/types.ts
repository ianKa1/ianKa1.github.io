export type Category = 'entry' | 'systems' | 'words' | 'visuals' | 'traces';

export interface CategoryConfig {
  id: Category;
  label: string;
  number: string;
  color: string;
  colorDeep: string;
}

export const CATEGORIES: CategoryConfig[] = [
  {
    id: 'entry',
    label: 'Entry',
    number: '00',
    color: 'var(--entry-cream)',
    colorDeep: 'var(--entry-warm)',
  },
  {
    id: 'systems',
    label: 'Systems',
    number: '01',
    color: 'var(--systems-blue)',
    colorDeep: 'var(--systems-blue-deep)',
  },
  {
    id: 'words',
    label: 'Words',
    number: '02',
    color: 'var(--words-red)',
    colorDeep: 'var(--words-red-deep)',
  },
  {
    id: 'visuals',
    label: 'Visuals',
    number: '03',
    color: 'var(--visuals-pink)',
    colorDeep: 'var(--visuals-pink-deep)',
  },
  {
    id: 'traces',
    label: 'Traces',
    number: '04',
    color: 'var(--traces-ink)',
    colorDeep: 'var(--traces-ink-deep)',
  },
];
