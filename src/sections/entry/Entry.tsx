import { SectionShell } from '../../content/SectionShell';
import sectionStyles from '../../content/SectionShell.module.css';

export function Entry() {
  return (
    <SectionShell id="entry" category="entry">
      <p className={sectionStyles.greeting}>Welcome, stranger.</p>
      <h1 className={sectionStyles.title}>
        I build things<br />& wonder about <em>everything</em>
      </h1>
      <p className={sectionStyles.text}>
        I'm a programmer who reads too much philosophy, paints occasionally,
        and believes that code and art share the same root: making order from chaos,
        then questioning that order.
      </p>
      <p className={sectionStyles.text}>
        This is a space where technical systems meet human stories.
        Navigate left to explore what I've been thinking about, building,
        and collecting along the way.
      </p>
    </SectionShell>
  );
}
