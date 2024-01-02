import type { InjectionKey } from 'vue'

export const setElementKey = Symbol('set-element-ref') as InjectionKey<(target: HTMLElement) => void>
export const setContentKey = Symbol('set-content-ref') as InjectionKey<(content: string) => void>
