import { DirectiveBinding } from 'vue-demi'

export interface VueCompatElement extends HTMLElement {
  __vueHeroAnimation?: any
}

export interface VueCompatBinding extends DirectiveBinding {
  value: any
  oldValue: any
}