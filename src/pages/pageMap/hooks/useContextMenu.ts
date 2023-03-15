import L from 'leaflet'
import type { Ref } from 'vue'
import { render } from 'vue'
import { ceil } from 'lodash'
import { ContextMenu, MarkerCreatePanel } from '@/pages/pageMap/components'
import { useMap } from '@/pages/pageMap/hooks'
import type { GenshinMap } from '@/pages/pageMap/core'
import { useAreaList, useGlobalDialog } from '@/hooks'
import { useMapStore } from '@/stores'
import { AppSettings } from '@/components'

/** 传递给右键菜单的参数 */
interface ContextMenuHookOptions {
  selectedItem: Ref<API.ItemVo | undefined>
  refreshMarkers: () => void
}

/** 传递给新增/编辑面板的参数 */
interface MarkerCreateFormProps {
  latlng: L.LatLng
  selectedArea?: API.AreaVo
}

/** 右键菜单管理 */
export const useContextMenu = (options: ContextMenuHookOptions) => {
  const { refreshMarkers, selectedItem } = options

  const ctx = getCurrentInstance()
  const mapStore = useMapStore()
  const { map } = useMap()
  const { areaList } = useAreaList()
  const { DialogService } = useGlobalDialog()

  /** 打开点位新建面板 */
  const openMarkerEditPanel = (props: MarkerCreateFormProps) => {
    const { latlng } = props
    const { lat, lng } = latlng
    DialogService
      .config({
        title: `新增点位：${props.selectedArea?.name} - (${ceil(lat, 2)}, ${ceil(lng, 2)})`,
        alignCenter: true,
        width: 'fit-content',
        class: 'transition-all',
      })
      .props({
        selectedItem: selectedItem.value,
        ...props,
      })
      .open(MarkerCreatePanel)
  }

  /** 关闭右键面板的方法 */
  const closeCB = shallowRef<(() => void) | null>(null)

  // 在离开当前路由时关闭右键面板以避免奇怪的 bug
  onBeforeRouteLeave(() => {
    closeCB.value?.()
  })

  /** 右键菜单的弹层实例 */
  const menu = L.popup({
    closeButton: false,
    className: 'no-arrow',
    offset: [112, 226],
  })

  // 由于组件是虚拟 DOM，在渲染前是没有宽高的，所以这里的父元素必须预先指定尺寸
  const div = L.DomUtil.create('div')
  div.style.width = '172px'
  div.style.height = '172px'

  const openSettingDialog = () => {
    closeCB.value?.()
    DialogService
      .config({
        title: '设置界面',
        alignCenter: true,
        width: 'fit-content',
      })
      .open(AppSettings)
  }

  /**
   * 打开右键菜单
   * @注意 此处不应该传递过多业务信息，传递的信息应只与事件本身相关（如事件坐标、对象等）
   */
  const openContextMenu = (ev: L.LeafletMouseEvent) => {
    if (map.value?.handleState.draggingMarker)
      return

    const selectedArea = areaList.value.find(area => area.code === mapStore.areaCode)

    /** 右键菜单支持的命令 */
    const onCommand = (command: string) => ({
      add: () => openMarkerEditPanel({ latlng: ev.latlng, selectedArea }),
      refresh: refreshMarkers,
      setting: openSettingDialog,
    } as Record<string, () => void>)[command]?.()

    /** 预渲染右键菜单使用的组件 */
    const vnode = h(ContextMenu, {
      latlng: ev.latlng,
      selectedArea,
      onCommand,
    })
    vnode.appContext = ctx?.appContext ?? null
    render(vnode, div)

    menu
      .setContent(div)
      .setLatLng(ev.latlng)
      .openOn(ev.target)

    closeCB.value = () => (ev.target as GenshinMap).closePopup()

    return menu
  }

  return { openContextMenu }
}
