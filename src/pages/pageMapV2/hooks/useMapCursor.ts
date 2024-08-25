const sharedContext = {
  cursorRef: ref<HTMLElement>(),
  isVisible: ref(false),
  pos: ref({ x: 0, y: 0 }),
}

export const useMapCursor = (isRoot = false) => {
  if (isRoot) {
    useEventListener('pointermove', ({ pageX, pageY }) => {
      if (!sharedContext.isVisible.value)
        return
      sharedContext.pos.value.x = pageX
      sharedContext.pos.value.y = pageY
    })
  }

  return {
    ...sharedContext,
  }
}
