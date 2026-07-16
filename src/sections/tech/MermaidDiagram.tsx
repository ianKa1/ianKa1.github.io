import { useEffect, useId, useState } from 'react';
import styles from './MermaidDiagram.module.css';

/* Mermaid is ~large, so it is loaded on demand the first time a diagram
   mounts, initialized once, and shared by every subsequent diagram. */
let mermaidPromise: Promise<typeof import('mermaid')['default']> | null = null;

function loadMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid').then(({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: 'neutral',
        fontFamily: "'DM Sans', sans-serif",
        themeVariables: {
          primaryColor: '#EBF2F9',
          primaryBorderColor: '#7BA3CC',
          primaryTextColor: '#2C2C2C',
          lineColor: '#7A7A7A',
          fontSize: '14px',
        },
      });
      return mermaid;
    });
  }
  return mermaidPromise;
}

interface MermaidDiagramProps {
  chart: string;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [svg, setSvg] = useState('');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadMermaid()
      .then((mermaid) => mermaid.render(`mermaid-${id}`, chart))
      .then(({ svg: rendered }) => {
        if (!cancelled) setSvg(rendered);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [chart, id]);

  if (failed) {
    return (
      <pre className={styles.fallback}>
        <code>{chart}</code>
      </pre>
    );
  }

  return (
    <div
      className={styles.diagram}
      role="img"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
