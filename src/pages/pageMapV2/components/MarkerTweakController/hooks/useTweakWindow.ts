import { mapWindowContext } from '@/pages/pageMapV2/components'

export const useTweakWindow = (windowName: string, beforeClose?: () => boolean) => {
  const id = crypto.randomUUID()

  const openWindow = () => {
    if (mapWindowContext.getWindow(id))
      return
    mapWindowContext.openWindow({
      id,
      name: windowName,
      minWidth: 700,
      beforeClose,
    })
  }

  const closeWindow = () => {
    mapWindowContext.closeWindow(id)
  }

  onBeforeUnmount(close)

  return {
    id,
    openWindow,
    closeWindow,
  }
}
