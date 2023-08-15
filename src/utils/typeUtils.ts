export const isMarkerVo = (v: unknown): v is API.MarkerVo => {
  if (typeof v !== 'object' || v === null)
    return false
  for (const key of ['id', 'markerTitle', 'position', 'itemList']) {
    if (v[key as keyof typeof v] === undefined)
      return false
  }
  return true
}
