import { ref, shallowRef } from 'vue'
import type { Component } from 'vue'
import type { DialogProps } from 'element-plus'

export const context = {
  visible: ref(false),
  component: shallowRef<Component | null>(null),
  props: ref<Record<string, unknown>>({}),
  slots: ref<Record<string, Component>>({}),
  payloadCache: ref<unknown>(),
  dialogProps: ref<Omit<Partial<DialogProps>, 'modelValue'>>({}),
  closeResolver: ref<((payload: unknown) => void) | null>(null),
  listener: ref<Record<string, Function>>({}),
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
