export interface TransformedScore {
  user: API.SysUserSmallVo & {
    id: number
  }
  count: number
  maxFields: number
  fields: { key: string; label: string; value: number }[]
  chars: {
    markerTitleChars: number
    contentChars: number
  }
}
