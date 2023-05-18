export const isMarkerVo = (v: unknown): v is API.MarkerVo => {
  if (typeof v !== 'object' || v === null)
    return false
  return ['markerTitle', 'position', 'content', 'extra'].every(property => property in v)
}
