declare module 'vue-virtual-scroller' {
  import type { DefineComponent } from 'vue'
  import { RecycleScroller } from 'vue-virtual-scroller'

  const RecycleScroller: DefineComponent<{
    disableTransform?: boolean
    gridItems?: number
    items: unknown[]
    itemSize?: number
    itemSecondarySize?: number
    keyField: string
    listClass?: string
    itemClass?: srting
    pageMode?: boolean
  }>

  export { RecycleScroller }
}