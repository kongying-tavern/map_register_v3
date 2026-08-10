import type { ItemVo, MarkerItemLinkVo } from '@/api/alova/globals'

export interface ItemTabProps {
  label: string
  name: string
}

export interface InternalItemData extends MarkerItemLinkVo {
  _raw: ItemVo
}
