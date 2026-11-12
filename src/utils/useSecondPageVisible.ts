import { useState, useEffect } from 'react';

/**
 * High-performance hook replacing synchronous getBoundingClientRect scroll listeners
 * with a zero-reflow IntersectionObserver.
 * Triggers when page-2-section scrolls past the 80px fixed navbar.
 */
export function useSecondPageVisible(dependencyKey?: unknown): boolean {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let fallbackCleanup: (() => void) | null = null;

    const setupObserver = () => {
      const page2 = document.getElementById('page-2-section');
      if (page2 && typeof IntersectionObserver !== 'undefined') {
        observer = new IntersectionObserver(
          (entries) => {
            const entry = entries[0];
            if (!entry) return;
            // Visible when intersecting within the -85px top margin (past 80px navbar) or scrolled past it
            const arrivedAtSecondPage =
              entry.isIntersecting ||
              (entry.boundingClientRect.top <= 85 && entry.boundingClientRect.bottom > 0);
            setIsVisible(arrivedAtSecondPage);
          },
          {
            rootMargin: '-85px 0px 0px 0px',
            threshold: [0, 0.05, 0.2],
          }
        );
        observer.observe(page2);
      } else {
        // Fallback for internal sub-pages without page-2-section using throttled scroll check
        let ticking = false;
        const handleScroll = () => {
          if (!ticking) {
            window.requestAnimationFrame(() => {
              const threshold = Math.max(window.innerHeight * 0.9, 700);
              setIsVisible(window.scrollY >= threshold);
              ticking = false;
            });
            ticking = true;
          }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        fallbackCleanup = () => window.removeEventListener('scroll', handleScroll);
        handleScroll();
      }
    };

    // Give DOM a frame to settle after route mount
    const timer = setTimeout(setupObserver, 50);

    return () => {
      clearTimeout(timer);
      if (observer) observer.disconnect();
      if (fallbackCleanup) fallbackCleanup();
    };
  }, [dependencyKey]);

  return isVisible;
}
