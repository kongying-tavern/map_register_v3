// 通用组件不关心传递属性的类型
import type { Component } from 'vue'
import type { ButtonProps, DialogProps } from 'element-plus'
import type { AnyObject } from '@/shared'

export const visible = ref(false)
export const props = ref<AnyObject>({})
export const dialogProps = ref<Omit<Partial<DialogProps>, 'modelValue'>>({})
export const component = shallowRef<Component | null>(null)
export const closeResolver = ref<((payload: unknown) => void) | null>(null)
export const payloadCache = ref<unknown>()
export const buttons = ref<Map<string, FooterButton>>(new Map())
/** 弹窗内部事件处理 */
export const eventListener = ref<Record<string, (event: string) => void>>({})

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
  eventListener.value = {}
}

/** 该方法仅用于保证外部 afterClosed 被调用 */
export const resolveResult = <T>(payload?: T) => {
  payloadCache.value = payload
  closeResolver.value?.(payload)
}
