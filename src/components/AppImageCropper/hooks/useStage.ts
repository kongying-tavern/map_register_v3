import type Konva from 'konva'

export const useStage = (containerRef: Ref<HTMLElement>) => {
  const stage = shallowRef<Konva.Stage | null>(null)

  const width = ref(0)
  const height = ref(0)

  useResizeObserver(containerRef, ([{ contentRect: { width: cw, height: ch } }]) => {
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
