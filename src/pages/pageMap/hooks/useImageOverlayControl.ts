import L from 'leaflet'
import type { Ref } from 'vue'

export const useImageOverlayControl = (target: Ref<L.ImageOverlay | L.ImageOverlay[] | null>) => {
  type MoveOffset = [xmin: number, ymin: number, xmax: number, ymax: number]

  const getMoveOffset = (code: string) => ({
    KeyW: [0, -10, 0, -10],
    KeyS: [0, +10, 0, +10],
    KeyA: [-10, 0, -10, 0],
    KeyD: [+10, 0, +10, 0],
    Semicolon: [0, 0, +10, +10],
    Quote: [0, 0, -10, -10],
  } as Record<string, MoveOffset | undefined>)[code]

  const moveLayer = (layer: L.ImageOverlay, moveOffset: MoveOffset) => {
    const oldBounds = layer.getBounds()
    const xmin = oldBounds.getSouth()
    const ymin = oldBounds.getWest()
    const xmax = oldBounds.getNorth()
    const ymax = oldBounds.getEast()

    const [offsetXmin, offsetYmin, offsetXmax, offsetYmax] = moveOffset
    layer.setBounds(L.latLngBounds(
      [xmin + offsetXmin, ymin + offsetYmin],
      [xmax + offsetXmax, ymax + offsetYmax],
    ))
  }

  useEventListener(window, 'keydown', (ev) => {
    const moveOffset = getMoveOffset(ev.code)
    if (!moveOffset || !target.value)
      return

    if (Array.isArray(target.value)) {
      target.value.forEach((overlay) => {
        moveLayer(overlay, moveOffset)
      })
      return
    }
    moveLayer(target.value, moveOffset)
  })
}
