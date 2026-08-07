import { useEffect, useRef, useState } from 'react';

const REVEAL_BUFFER_PX = 300;

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Fallback for environments without IntersectionObserver.
    if (typeof IntersectionObserver === 'undefined') {
      setIsRevealed(true);
      return;
    }

    // Reveal immediately when the element already sits inside (or just above /
    // below) the viewport. This also sidesteps observers that never fire for
    // elements mounted inside a skipped `content-visibility` subtree.
    const isNearViewport = () => {
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight + REVEAL_BUFFER_PX;
    };
    if (isNearViewport()) {
      setIsRevealed(true);
      return;
    }

    let revealed = false;
    const finish = () => {
      if (revealed) return;
      revealed = true;
      setIsRevealed(true);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) finish();
      },
      { threshold: 0.05, ...options }
    );

    // Safety net: if the observer never reports an intersection (e.g. due to a
    // scroll container it can't see into), reveal as soon as the element gets
    // close to the viewport so content is never left permanently hidden.
    const onScroll = () => {
      if (isNearViewport()) finish();
    };

    observer.observe(el);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return { ref, isRevealed };
}
