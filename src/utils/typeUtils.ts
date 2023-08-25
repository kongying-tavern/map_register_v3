import type { Coordinate2D } from '@/pages/pageMapV2/core'

export const isMarkerVo = (v: unknown): v is API.MarkerVo => {
  if (typeof v !== 'object' || v === null)
    return false
  for (const key of ['id', 'markerTitle', 'position', 'itemList']) {
    if (v[key as keyof typeof v] === undefined)
      return false
  }
  return true
}

export const isMovingMarker = (v: unknown): v is { origin: API.MarkerVo; offset: Coordinate2D } => {
  if (typeof v !== 'object' || v === null)
    return false
  if (!isMarkerVo((v as Record<string, unknown>).origin))
    return false
  if (!Array.isArray((v as Record<string, unknown>).offset))
    return false
  return true
}

export const isItemVo = (v: unknown): v is API.ItemVo => {
  if (typeof v !== 'object' || v === null)
    return false
  for (const key of ['id', 'areaId', 'name', 'defaultCount', 'typeIdList']) {
    if (v[key as keyof typeof v] === undefined)
      return false
  }
  return true
}
