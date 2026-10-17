import { animate } from 'animejs';

/**
 * Runs a subtle, high-performance entrance animation on mounted elements
 * Respects prefers-reduced-motion
 */
export function animatePanelEntrance(target: HTMLElement | string) {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  try {
    animate(target, {
      opacity: [0, 1],
      translateY: [8, 0],
      duration: 400,
      ease: 'outQuad'
    });
  } catch {
    // Graceful fallback if Anime.js target is not attached
  }
}
