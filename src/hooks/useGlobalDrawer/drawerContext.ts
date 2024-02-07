// 通用组件不关心传递属性的类型
import type { Component } from 'vue'
import type { DrawerProps } from 'element-plus'
import type { AnyObject } from '@/shared'

export const visible = ref(false)
export const props = ref<AnyObject>({})
export const drawerProps = ref<Omit<Partial<DrawerProps>, 'modelValue'>>({})
export const component = shallowRef<Component | null>(null)
export const closeResolver = ref<((payload: unknown) => void) | null>(null)
export const payloadCache = ref<unknown>()
/** 弹窗内部事件处理 */
export const eventListener = ref<Record<string, (event: string) => void>>({})

/** 重置状态 */
export const resetState = () => {
  props.value = {}
  drawerProps.value = {}
  payloadCache.value = null
  component.value = null
  closeResolver.value = null
  eventListener.value = {}
}

/** 该方法仅用于保证外部 afterClosed 被调用 */
export const resolveResult = <T>(payload?: T) => {
  payloadCache.value = payload
  closeResolver.value?.(payload)
}
