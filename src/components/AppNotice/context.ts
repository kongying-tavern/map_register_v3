import type { EventHook } from '@vueuse/core'

export interface NoticeContext {
  dialogRef: Ref<HTMLDialogElement | null>
  visible: Ref<boolean>
  closeHook: EventHook<string | undefined>
  show: () => void
  close: (returnValue?: string) => void
}

export const context: NoticeContext = {
  dialogRef: ref(null),

  visible: ref(false),

  closeHook: createEventHook(),

  show: () => {
    context.dialogRef.value?.showModal()
    context.visible.value = true
  },

  close: (returnValue?: string) => {
    context.dialogRef.value?.close(returnValue)
    context.visible.value = false
    context.closeHook.trigger(returnValue)
  },
}
