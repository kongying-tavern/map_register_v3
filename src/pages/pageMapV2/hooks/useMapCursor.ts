import { useBanner } from '@/hooks'

const sharedContext = {
  cursorRef: ref<HTMLElement | null>(null),
  isVisible: ref(false),
  pos: ref({ x: 0, y: 0 }),
}

export const useMapCursor = (isRoot = false) => {
  const { visible, height: bannerHeight } = useBanner()

  if (isRoot) {
    useEventListener('pointermove', ({ pageX, pageY }) => {
      if (!sharedContext.isVisible.value)
        return
      sharedContext.pos.value.x = pageX
      sharedContext.pos.value.y = pageY - (visible.value ? bannerHeight : 0)
    })
  }

  return {
    ...sharedContext,
  }
}
