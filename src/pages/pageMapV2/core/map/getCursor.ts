import type { GenshinMap } from '.'

export const getCursor = (target: GenshinMap, state: { isDragging: boolean; isHovering: boolean }) => {
  if (state.isDragging)
    return 'grabbing'

  if (!state.isHovering)
    return 'inherit'

  if (target.store.map.getMission('moveMarkers'))
    return 'move'

  return target.store.map.hover ? 'pointer' : 'inherit'
}
