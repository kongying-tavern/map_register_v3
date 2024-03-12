export const context = {
  dialogRef: ref<HTMLDialogElement | null>(null),

  show: () => {
    context.dialogRef.value?.showModal()
  },

  close: (returnValue?: string) => {
    context.dialogRef.value?.close(returnValue)
  },
}
