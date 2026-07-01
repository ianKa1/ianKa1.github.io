import { visuals } from '../../data/visuals';
import { SectionShell } from '../../content/SectionShell';
import sectionStyles from '../../content/SectionShell.module.css';
import { Gallery } from './Gallery';

export function Visuals() {
  return (
    <SectionShell id="visuals" category="visuals">
      <h1 className={sectionStyles.title}>Visuals</h1>
      <p className={sectionStyles.text}>
        Images I've made and images I've loved. Paintings, photographs,
        design references, film stills — a collection of things that
        taught my eye something.
      </p>
      <Gallery images={visuals} />
    </SectionShell>
  );
}
