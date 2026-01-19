import { Ref } from 'vue-demi';

export interface HeroAnimationProps {
  id: string;
  duration?: `${number}s` | `${number}ms`;
  timingFunction?: 'ease' | 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | string;
  delay?: `${number}s` | `${number}ms`;
  position?: 'absolute' | 'fixed';
  zIndex?: number;
  container?: string | Ref<HTMLElement>
}

export interface AnimatingInfo {
  el: HTMLElement;
  count: number;
  elapsed: number;
  startTime: number;
}