import { App } from "vue-demi";
import heroAnimationDirective from './directive/hero'

// Vue3插件
export const VueHero = {
  install(app: App) {
    if (app.version?.startsWith('3')) {
      app.directive('hero', heroAnimationDirective);
    }
  }
}

// 默认导出
export default VueHero

// 导出指令
export { heroAnimationDirective as vHero }

// 导出类型
export * from './types'