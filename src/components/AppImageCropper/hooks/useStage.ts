import type Konva from 'konva'

export const useStage = (containerRef: Ref<HTMLElement>) => {
  const stage = shallowRef<Konva.Stage | null>(null)

  const width = ref(1)
  const height = ref(1)

  useResizeObserver(containerRef, ([{ contentRect: { width: cw, height: ch } }]) => {
    if (cw <= 0 || ch <= 0)
      return
    stage.value?.size({ width: cw, height: ch })
    width.value = cw
    height.value = ch
  })

  return {
    stage,
    width,
    height,
  }
}
