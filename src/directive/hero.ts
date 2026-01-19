import { heroAnimation, registerHero, unregisterHero, validatePair } from './utils';
import type { HeroAnimationProps } from '@/types';
import type { Directive } from 'vue-demi';

const heroAnimationDirective: Directive<HTMLElement, HeroAnimationProps> = {
  mounted(el, { value }) {
    const heroId = value.id;
    el.dataset.heroId = heroId;
    registerHero(el, heroId);

    queueMicrotask(() => validatePair(heroId));
  },
  updated(el, { value }) {
    if (!(el as any).__isVShowPair) return
    const wasHidden = (el as any).__wasHidden;
    const display = getComputedStyle(el).display;
    if (!wasHidden) {
      heroAnimation(el, value);
    }
    (el as any).__wasHidden = display === 'none';
    (display !== 'none' && !(el as any).__originDisplay) && ((el as any).__originDisplay = display);
  },
  beforeUnmount(el, { value }) {
    if ((el as any).__isVIfPair) {
      heroAnimation(el, value);
    }
    unregisterHero(el, value.id);
  }
};

export default heroAnimationDirective;