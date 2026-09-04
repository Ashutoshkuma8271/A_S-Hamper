import { useEffect, useRef, useState } from 'react';

export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let observer: IntersectionObserver | null = null;
    let idleId: number | null = null;

    const initObserver = () => {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisible(true);
              if (observer && el) observer.unobserve(el);
            }
          });
        },
        { threshold: 0.1, rootMargin: '50px 0px 0px 0px' }
      );
      observer.observe(el);
    };

    if ('requestIdleCallback' in window) {
      idleId = (window as any).requestIdleCallback(initObserver);
    } else {
      initObserver();
    }

    return () => {
      if (idleId !== null && 'cancelIdleCallback' in window) {
        (window as any).cancelIdleCallback(idleId);
      }
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  return { ref, visible };
}
