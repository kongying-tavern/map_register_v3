import L from 'leaflet'
import { render } from 'vue'
import { ceil } from 'lodash'
import { ContextMenu, MarkerEditForm } from '../components'
import type { GenshinMap } from '../utils'
import { useGlobalDialog } from '@/hooks'
import { useUserStore } from '@/stores'

interface ContextMenuHookOptions {
  refreshMarkers?: () => void
}

/** 右键菜单管理 */
export const useContextMenu = (options: ContextMenuHookOptions = {}) => {
  const { refreshMarkers } = options

  const { DialogService } = useGlobalDialog()

  const openMarkerEditPanel = (hasPunctauteRights: boolean, latlng: L.LatLng) => {
    if (!hasPunctauteRights)
      return
    const { lat, lng } = latlng
    DialogService
      .config({
        title: `新增点位：(${ceil(lat, 2)}, ${ceil(lng, 2)})`,
        top: '5vh',
        width: '400px',
      })
      .props({
        latlng,
      })
      .open(MarkerEditForm)
  }

  const closeCB = shallowRef<(() => void) | null>(null)

  onBeforeRouteLeave(() => {
    closeCB.value?.()
  })

  const userStore = useUserStore()

  const createContextMenu = (ev: L.LeafletMouseEvent, props?: Record<string, any>) => {
    const onCommand = (command: string) => {
      ({
        add: () => openMarkerEditPanel(userStore.hasPunctauteRights, ev.latlng),
        refresh: refreshMarkers,
      } as Record<string, (() => void) | undefined>)[command]?.()
    }

    const menu = L.popup({
      closeButton: false,
      className: 'no-arrow',
      offset: [112, 226],
    })
    menu.setContent(() => {
      const div = L.DomUtil.create('div')
      div.style.width = '172px'
      div.style.height = '172px'
      const content = h(ContextMenu, {
        latlng: ev.latlng,
        hasPunctauteRights: userStore.hasPunctauteRights,
        ...props,
        onCommand: (command: string) => {
          (ev.target as GenshinMap).closePopup(menu)
          onCommand(command)
        },
      })
      render(content, div)
      return div
    })

    closeCB.value = () => (ev.target as GenshinMap).closePopup(menu)

    return menu
  }

  const show = (ev: L.LeafletMouseEvent, props?: Record<string, any>) => {
    const menu = createContextMenu(ev, props)
    return menu.setLatLng(ev.latlng)
      .openOn(ev.target)
  }

  return { createContextMenu, show }
}
