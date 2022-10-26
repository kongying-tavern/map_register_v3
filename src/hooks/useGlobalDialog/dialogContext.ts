import type { Component } from 'vue'
import type { ButtonProps, DialogProps } from 'element-plus'

export const visible = ref(false)
export const props = ref<Record<string, any>>({})
export const dialogProps = ref<Omit<Partial<DialogProps>, 'modelValue'>>({})
export const component = shallowRef<Component | null>(null)
export const closeResolver = ref<((payload: any) => void) | null>(null)
export const payloadCache = ref<any>()
export const buttons = ref<Map<string, FooterButton>>(new Map())

export interface FooterButton {
  text: string
  props?: Partial<ButtonProps>
  onClick?: (ev: MouseEvent) => void
}

/** 重置状态 */
export const resetState = () => {
  props.value = {}
  dialogProps.value = {}
  payloadCache.value = null
  component.value = null
  closeResolver.value = null
  buttons.value.clear()
}

/** 该方法仅用于保证外部 afterClosed 被调用 */
export const resolveResult = <T>(payload?: T) => {
  payloadCache.value = payload
  closeResolver.value?.(payload)
}
