import { useEffect, useRef, useState, type ComponentType } from 'react';

type DeferredSectionProps = {
  load: () => Promise<{ default: ComponentType }>;
  minHeight: number;
};

/** Loads non-critical homepage sections shortly before they scroll into view. */
export default function DeferredSection({ load, minHeight }: DeferredSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [Section, setSection] = useState<ComponentType | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || Section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        load().then((module) => setSection(() => module.default));
      },
      { rootMargin: '600px 0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [Section, load]);

  return (
    <div ref={ref} className="cv-auto" style={{ minHeight: Section ? undefined : minHeight }}>
      {Section && <Section />}
    </div>
  );
}
