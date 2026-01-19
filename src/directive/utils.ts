import { isRef, nextTick } from 'vue-demi';
import type { AnimatingInfo, HeroAnimationProps } from '@/types/hero';

// 元素映射表 用于v-show 元素对的匹配
const heroMap = new Map<string, Set<HTMLElement>>();
// 正在进行的动画元素映射表
const animatingMap = new Map<string, AnimatingInfo>();

/**
 * 注册Hero元素
 * @param el Hero元素
 * @param heroId Hero ID
 */
export function registerHero(el: HTMLElement, heroId: string) {
  if (!heroMap.has(heroId)) {
    heroMap.set(heroId, new Set());
  }
  heroMap.get(heroId)?.add(el);
}

/**
 * 注销Hero元素
 * @param el Hero元素
 * @param heroId Hero ID
 */
export function unregisterHero(el: HTMLElement, heroId: string) {
  const set = heroMap.get(heroId);
  if (set) {
    set.delete(el);
    if (set.size === 0) heroMap.delete(heroId);
  }
}

/**
 * 验证Hero元素对是否匹配
 * @param heroId Hero ID
 */
export function validatePair(heroId: string) {
  const set = heroMap.get(heroId);
  if (set) {
    if (set.size === 2) {
      set.forEach(el => {
        const display = getComputedStyle(el).display;
        (el as any).__isVShowPair = true;
        (el as any).__wasHidden = display === 'none';
        display !== 'none' && ((el as any).__originDisplay = display);
      });
    } else if (set?.size < 2) {
      set.forEach(el => (el as any).__isVIfPair = true);
      heroMap.delete(heroId);
    } else {
      console.error(`Hero ID "${heroId}" 有 ${set.size} 个元素，预期 2 个`);
    }
  }
}

/**
 * 复制元素的样式到目标元素
 * @param source 源元素
 * @param target 目标元素
 */
function copyStyles(source: HTMLElement, target: HTMLElement) {
  const computedStyle = window.getComputedStyle(source);
  const props = Array.from(computedStyle);

  const excludes = [
    'transition',
    'animation',
    'visibility',
    'position',
    'z-index',
    'left',
    'top',
    'right',
    'bottom',
    'width',
    'height',
    'inset',
    'text-decoration'
  ];
  for (const prop of props) {
    if (excludes.some(item => prop.includes(item))) continue;
    const value = computedStyle.getPropertyValue(prop);
    target.style.setProperty(prop, value);
  }
};

/**
 * 获取元素的矩形信息，考虑到 transform 影响
 * @param el 目标元素
 * @returns 元素的矩形信息
 */
function getRect(el: HTMLElement): DOMRect {
  const originalTransform = el.style.transform;
  const originalTransition = el.style.transition;
  el.style.transform = 'none';
  el.style.transition = 'none';
  const rect = el.getBoundingClientRect();
  el.style.transform = originalTransform;
  requestAnimationFrame(() => {
    el.style.transition = originalTransition;
  });
  return rect;
};

/**
 * 计算元素的位置，考虑到 position 为 absolute 时的偏移
 * @param rect 元素的矩形信息
 * @param containerRect 容器的矩形信息
 * @param position 元素的位置属性
 * @returns 元素的位置信息
 */
function getPosition(
  rect: DOMRect,
  containerRect: DOMRect,
  position: HeroAnimationProps['position']
): { left: number; top: number } {
  return {
    left: position === 'absolute' ? rect.left - containerRect.left : rect.left,
    top: position === 'absolute' ? rect.top - containerRect.top : rect.top,
  };
};

/**
 * 解析动画时长
 * @param d 时长字符串或数字
 * @returns 时长（毫秒）
 */
function parseDuration(d: string | number): number {
  if (typeof d === 'number') return d
  const match = String(d).match(/^([\d.]+)\s*(s|ms)?$/)
  if (!match) return 1000
  const [, n, unit] = match
  return unit === 's' ? parseFloat(n) * 1000 : parseInt(n, 10)
}

/**
 * 执行元素的动画过渡
 * @param source 目标元素
 * @param props 动画属性
 */
export async function heroAnimation(source: HTMLElement, props: HeroAnimationProps) {
  const {
    id: heroId,
    duration = '1s',
    timingFunction = 'ease',
    delay = '0s',
    position = 'fixed',
    zIndex = 9999,
    container = document.body
  } = props;

  // 解析时长
  let durationMs = parseDuration(duration);
  // 中断动画标识
  let isInterruptedAnimation = false;
  // 容器
  const containerEl: HTMLElement = isRef(container)
    ? container.value ?? document.body
    : typeof container === 'string'
      ? document.querySelector(container) ?? document.body
      : container;
  const containerRect = getRect(containerEl);

  const animatingInfo = animatingMap.get(heroId);
  // 存在正在进行的动画，需要中断
  if (animatingInfo) {
    const timeElapsed = performance.now() - animatingInfo.startTime;
    // 前进 还是 折返
    const isForward = animatingInfo.count % 2 === 0;

    animatingInfo.elapsed = isForward
      ? (animatingInfo.elapsed || 0) - timeElapsed
      : animatingInfo.elapsed + timeElapsed;
    
    durationMs = isForward
      ? durationMs - animatingInfo.elapsed
      : animatingInfo.elapsed;
    
    // 当前动画元素
    const animatingEl = animatingInfo.el;
    const animatingElStyle = window.getComputedStyle(animatingEl);

    // 克隆当前动画元素，用于新的动画
    const newSource = animatingEl.cloneNode(true) as HTMLElement;
    copyStyles(animatingEl, newSource);
    newSource.style.left = animatingElStyle.left;
    newSource.style.top = animatingElStyle.top;
    containerEl.appendChild(newSource);

    // 移除旧的动画元素
    containerEl.removeChild(animatingEl);
    
    source = newSource;
    isInterruptedAnimation = true;
  }

  // v-show 标识
  const isVShowPair = (source as any).__isVShowPair;

  // v-show情况下，需要先显示元素，才能获取到正确的位置信息
  if (isVShowPair) {
    source.style.setProperty('display', (source as any).__originDisplay || 'block');
    await nextTick();
  }

  const rect = getRect(source);
  const clone = source.cloneNode(true) as HTMLElement;

  copyStyles(source, clone);
  // v-show 恢复隐藏
  isVShowPair && source.style.setProperty('display', 'none');
  // 手动移除元素
  isInterruptedAnimation && containerEl.removeChild(source);
  await nextTick();

  let target: HTMLElement | null = null;

  if (isVShowPair) {
    const set = heroMap.get(heroId);
    set && set.forEach(item => item !== source && (target = item));
  } else {
    target = document.querySelector(
      `[data-hero-id="${heroId}"]:not([data-clone]):not([style*="display: none"])`
    ) as HTMLElement;
  }
  
  if (!target) return;
  
  const newRect = getRect(target);
  const pos = getPosition(rect, containerRect, position);
  clone.style.position = position;
  clone.style.zIndex = `${zIndex}`;
  clone.style.left = `${pos.left}px`;
  clone.style.top = `${pos.top}px`;
  clone.style.width = `${rect.width}px`;
  clone.style.height = `${rect.height}px`;
  clone.dataset.clone = 'true';

  target.style.visibility = 'hidden';

  containerEl.appendChild(clone);
  // 更新动画元素
  const animationData = animatingInfo || {
    el: clone,
    count: 1,
    elapsed: 0,
    startTime: performance.now(),
  }
  if (animatingInfo) {
    animatingInfo.el = clone;
    animatingInfo.count++;
    animatingInfo.startTime = performance.now();
  }
  animatingMap.set(heroId, animationData);

  requestAnimationFrame(() => {
    clone.style.transition = `all ${durationMs}ms ${timingFunction} ${delay}`;
    copyStyles(target!, clone);
    const newPos = getPosition(newRect, containerRect, position);
    clone.style.left = `${newPos.left}px`;
    clone.style.top = `${newPos.top}px`;
    clone.style.width = `${newRect.width}px`;
    clone.style.height = `${newRect.height}px`;

    clone.addEventListener('transitionend', () => {
      target!.style.visibility = 'visible';
      containerEl.removeChild(clone);
      animatingMap.delete(heroId);
    }, { once: true });
  });
};