export interface ItemTabProps {
  label: string
  name: string
}

export interface InternalItemData extends API.MarkerItemLinkVo {
  _raw: API.ItemVo
}
