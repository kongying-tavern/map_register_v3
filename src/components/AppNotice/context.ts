import type { EventHook } from '@vueuse/core'

export interface NoticeContext {
  dialogRef: Ref<HTMLDialogElement | null>
  newCount: Ref<number>
  currentRecords: Ref<Set<number>>
  visible: Ref<boolean>
  closeHook: EventHook<string | undefined>
  show(): void
  close(returnValue?: string): void
}

export const context: NoticeContext = {
  dialogRef: ref<HTMLDialogElement | null>(null),

  newCount: ref(0),

  currentRecords: ref(new Set<number>()),

  visible: ref(false),

  closeHook: createEventHook<string | undefined>(),

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
