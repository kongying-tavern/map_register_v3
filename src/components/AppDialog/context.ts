import type { DialogProps } from 'element-plus'
import type { Component } from 'vue'

export const context = {
  visible: ref(false),
  component: shallowRef<Component | null>(null),
  props: ref<Record<string, unknown>>({}),
  payloadCache: ref<unknown>(),
  dialogProps: ref<Omit<Partial<DialogProps>, 'modelValue'>>({}),
  closeResolver: ref<((payload: unknown) => void) | null>(null),
  listener: ref<Record<string, (...args: unknown[]) => void>>({}),
  resetState: () => {
    context.props.value = {}
    context.dialogProps.value = {}
    context.payloadCache.value = null
    context.component.value = null
    context.closeResolver.value = null
    context.listener.value = {}
  },
  resolveResult: <T>(payload: T) => {
    context.payloadCache.value = payload
    context.closeResolver.value?.(payload)
  },
}
