import type { Ref } from 'vue'
import type { OverlayOptions } from '../config'
import { LAYER_CONFIGS } from '../config'

export interface OverlayGroup {
  bounds: [xmin: number, ymin: number, xmax: number, ymax: number]
  children: OverlayExtraObject[]
}

export interface OverlayExtraObject extends OverlayOptions {
  id: string
  visible: boolean
  overlayBounds: [xmin: number, ymax: number, xmax: number, ymin: number]
}

/** 附加图层管理器，用于在 */
export class OverlayManager {
  #overlayGroups = ref<Record<string, OverlayGroup>>({})
  get overlayGroups() { return this.#overlayGroups.value }
  set overlayGroups(v) { this.#overlayGroups.value = v }

  #overlayMap: Ref<Record<string, OverlayExtraObject>>
  get overlayMap() { return this.#overlayMap.value }

  get overlays() { return this.#overlays.value }
  #overlays = computed<OverlayExtraObject[]>(() => {
    const arr: OverlayExtraObject[] = []
    for (const key in this.overlayMap) {
      const overlay = this.overlayMap[key]
      overlay.visible && arr.push(overlay)
    }
    return arr
  })

  constructor(overlays: OverlayOptions[] = []) {
    const overlayMap: Record<string, OverlayExtraObject> = {}

    this.overlayGroups = overlays.reduce((seed, overlay) => {
      const layer = LAYER_CONFIGS.find(layerCfg => layerCfg.areaCodes?.find(code => code === overlay.areaCode))
      if (!layer)
        return seed

      const [xmin, ymin, xmax, ymax] = overlay.bounds
      const [cx, cy] = layer.center ?? [0, 0]

      const rewriteOverlay: OverlayExtraObject = {
        ...overlay,
        overlayBounds: [xmin + cx, ymax + cy, xmax + cx, ymin + cy],
        id: crypto.randomUUID(),
        visible: true,
      }

      overlayMap[rewriteOverlay.id] = rewriteOverlay

      if (!rewriteOverlay.groupBy)
        return seed

      let group = seed[rewriteOverlay.groupBy]

      if (!group) {
        group = {
          bounds: rewriteOverlay.bounds,
          children: [rewriteOverlay],
        }
      }
      else {
        const [xmin, ymin, xmax, ymax] = rewriteOverlay.bounds
        const [groupXmin, groupYmin, groupXmax, groupYmax] = group.bounds
        // TODO 暂时使用最大正交包围盒算法获取 overlay 的坐标取值范围以便显示控制器
        group.bounds = [
          xmin < groupXmin ? xmin : groupXmin,
          ymin < groupYmin ? ymin : groupYmin,
          xmax > groupXmax ? xmax : groupXmax,
          ymax > groupYmax ? ymax : groupYmax,
        ]
        group.children.push(rewriteOverlay)
      }

      seed[rewriteOverlay.groupBy] = group

      return seed
    }, {} as Record<string, OverlayGroup>)

    this.#overlayMap = ref(overlayMap)
  }

  toggleVisible = (id: string) => {
    const { visible } = this.overlayMap[id]
    this.overlayMap[id].visible = !visible
  }
}
