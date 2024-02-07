import type { InjectionKey, Ref } from 'vue'

export const contentRefKey = Symbol('content-ref') as InjectionKey<Ref<HTMLElement | null>>
export const tabNameRefKey = Symbol('tab-name') as InjectionKey<Ref<string | undefined>>

export { default as SiderMenu } from './SiderMenu.vue'
export { default as SiderMenuItem } from './SiderMenuItem.vue'
