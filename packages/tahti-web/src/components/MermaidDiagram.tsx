import { useEffect, useId, useRef, useState } from 'react';

type Props = {
  chart: string;
  className?: string;
};

/**
 * Renders a Mermaid chart client-side (lazy-loads the mermaid package).
 */
export function MermaidDiagram({ chart, className }: Props) {
  const reactId = useId().replace(/:/g, '');
  const hostRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setError(null);

    void (async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: 'dark',
          fontFamily: 'inherit',
        });
        const id = `mmd-${reactId}-${Math.random().toString(36).slice(2, 8)}`;
        const { svg } = await mermaid.render(id, chart);
        if (cancelled || !hostRef.current) {
          return;
        }
        hostRef.current.innerHTML = svg;
        setReady(true);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Mermaid render failed',
          );
        }
      }
    })();

    return () => {
      cancelled = true;
      if (hostRef.current) {
        hostRef.current.innerHTML = '';
      }
    };
  }, [chart, reactId]);

  return (
    <div className={className}>
      {!ready && !error && (
        <p className="text-foreground-secondary text-sm">Rendering diagram…</p>
      )}
      {error && (
        <pre className="text-foreground-secondary border-border overflow-auto rounded border p-3 text-xs whitespace-pre-wrap">
          {error}
          {'\n\n'}
          {chart}
        </pre>
      )}
      <div
        ref={hostRef}
        className="mermaid-host overflow-x-auto [&_svg]:mx-auto [&_svg]:max-w-none"
      />
    </div>
  );
}
