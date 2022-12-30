import L from 'leaflet'
import type { Ref } from 'vue'
import { render } from 'vue'
import { ceil } from 'lodash'
import { ContextMenu, MarkerEditForm } from '../components'
import type { GenshinMap } from '../utils'
import { useGlobalDialog } from '@/hooks'
import { useUserStore } from '@/stores'

interface ContextMenuHookOptions {
  selectedItem: Ref<API.ItemVo | undefined>
  itemList: Ref<API.ItemVo[]>
  typeList: Ref<API.ItemTypeVo[]>
  iconMap: Ref<Record<string, string>>
  refreshMarkers: () => void
}

interface MarkerEditFormProps {
  hasPunctauteRights: boolean
  latlng: L.LatLng
  selectedItem?: API.ItemVo
  itemList: API.ItemVo[]
  typeList: API.ItemTypeVo[]
  iconMap: Record<string, string>
}

/** 右键菜单管理 */
export const useContextMenu = (options: ContextMenuHookOptions) => {
  const { refreshMarkers, selectedItem, itemList, iconMap, typeList } = options

  const { DialogService } = useGlobalDialog()

  /** 打开点位编辑面板 */
  const openMarkerEditPanel = (props: MarkerEditFormProps) => {
    const { latlng } = props
    const { lat, lng } = latlng
    DialogService
      .config({
        title: `新增点位：(${ceil(lat, 2)}, ${ceil(lng, 2)})`,
        top: '5vh',
        width: 'fit-content',
        class: 'transition-all',
      })
      .props(props)
      .open(MarkerEditForm)
  }

  const closeCB = shallowRef<(() => void) | null>(null)

  onBeforeRouteLeave(() => {
    closeCB.value?.()
  })

  const userStore = useUserStore()

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

  /** 打开右键菜单 */
  const openContextMenu = (ev: L.LeafletMouseEvent) => {
    /** 右键菜单支持的命令 */
    const onCommand = (command: string) => {
      ({
        add: () => openMarkerEditPanel({
          hasPunctauteRights: userStore.hasPunctauteRights,
          latlng: ev.latlng,
          selectedItem: selectedItem.value,
          itemList: itemList.value,
          typeList: typeList.value,
          iconMap: iconMap.value,
        }),
        refresh: refreshMarkers,
      } as Record<string, (() => void) | undefined>)[command]?.()
    }

    /** 预渲染右键菜单使用的组件 */
    render(h(ContextMenu, {
      latlng: ev.latlng,
      hasPunctauteRights: userStore.hasPunctauteRights,
      onCommand,
    }), div)

    menu
      .setContent(div)
      .setLatLng(ev.latlng)
      .openOn(ev.target)

    closeCB.value = () => (ev.target as GenshinMap).closePopup()

    return menu
  }

  return { openContextMenu }
}
