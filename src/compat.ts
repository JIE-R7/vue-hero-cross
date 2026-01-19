import { HeroAnimationProps } from "./types";
import type { Directive } from "vue-demi";

// 获取指令钩子名称
export const getHookName = (hook: string): string => {
  // Vue2的钩子名称映射
  const hookMap: Record<string, string> = {
    'mounted': 'inserted',
    'updated': 'componentUpdated',
    'unmounted': 'unbind'
  }
  return hookMap[hook] || hook
}

// 创建兼容指令
export function createCompatDirective(directive: Directive<HTMLElement, HeroAnimationProps>): Record<'vue2' | 'vue3', Directive> {
  const vue2CompatDirective: any = {}

  Object.keys(directive).forEach(hook => {
    const compatHook = getHookName(hook)
    vue2CompatDirective[compatHook] = directive[hook as keyof Directive<HTMLElement, HeroAnimationProps>]
  })

  return {
    vue2: vue2CompatDirective,
    vue3: directive
  }
}
