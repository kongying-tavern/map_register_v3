import type { PageIPC } from '@/utils/worker'
import Api from '@/api/api'
import { HistoryRecordType } from '@/shared'
import { EventBus } from '@/utils'

export const useAppEvent = (ipc: PageIPC<AppSocket.MainEventMap, AppSocket.WorkerEventMap>) => {
  const appEvent = new EventBus<Socket.DataEventMap>()

  // ==================== 应用 ====================
  ipc.on('AppUpdated', () => {
    appEvent.emit('AppUpdated')
  })

  ipc.on('UserKickedOut', () => {
    appEvent.emit('UserKickedOut')
  })

  // ==================== 图标 ====================
  ipc.on('IconBinaryPurged', () => {
    appEvent.emit('IconBinaryPurged')
  })

  // ==================== 物品 ====================
  ipc.on('ItemAdded', async (id) => {
    const { data: [itemInfo] = [], users = {} } = await Api.item.listItemById([id])
    if (!itemInfo)
      return
    const userInfo = Object.assign({ id: itemInfo.creatorId }, users[itemInfo.creatorId!])
    appEvent.emit('ItemAdded', itemInfo, userInfo)
  })

  ipc.on('ItemUpdated', async (id) => {
    const { data: [itemInfo] = [], users = {} } = await Api.item.listItemById([id])
    if (!itemInfo)
      return
    const userInfo = Object.assign({ id: itemInfo.creatorId }, users[itemInfo.creatorId!])
    appEvent.emit('ItemUpdated', itemInfo, userInfo)
  })

  ipc.on('ItemDeleted', async (id) => {
    const { data: { record: [history] = [] } = {}, users = {} } = await Api.history.searchHistory({
      current: 0,
      id: [id],
      size: 1,
      type: HistoryRecordType.ITEM,
      sort: ['updateTime-'],
    })
    const itemInfo = JSON.parse(history.content!) as API.ItemVo
    const userInfo = Object.assign({ id: history.creatorId }, users[history.creatorId!])
    appEvent.emit('ItemDeleted', itemInfo, userInfo)
  })

  ipc.on('ItemBinaryPurged', () => {
    appEvent.emit('ItemBinaryPurged')
  })

  // ==================== 点位 ====================
  ipc.on('MarkerAdded', async (id) => {
    const { data: [markerInfo] = [], users = {} } = await Apis.marker.listMarkerById({
      data: { markerIdList: [id] },
    })
    if (!markerInfo)
      return
    const userInfo = Object.assign({ id: markerInfo.creatorId }, users[markerInfo.creatorId!])
    appEvent.emit('MarkerAdded', markerInfo, userInfo)
  })

  ipc.on('MarkerBinaryPurged', () => {
    appEvent.emit('MarkerBinaryPurged')
  })

  ipc.on('MarkerDeleted', async (id) => {
    const { data: { record: [history] = [] } = {}, users = {} } = await Api.history.searchHistory({
      current: 0,
      id: [id],
      size: 1,
      type: HistoryRecordType.MARKER,
      sort: ['updateTime-'],
    })
    const markerInfo = JSON.parse(history.content!) as API.MarkerVo
    const userInfo = Object.assign({ id: history.creatorId }, users[history.creatorId!])
    appEvent.emit('MarkerDeleted', markerInfo, userInfo)
  })

  ipc.on('MarkerLinkageBinaryPurged', () => {
    appEvent.emit('MarkerLinkageBinaryPurged')
  })

  ipc.on('MarkerLinked', async ({ markers: ids }) => {
    const { data = [], users = {} } = await Apis.marker.listMarkerById({
      data: { markerIdList: ids },
    })
    if (!data.length)
      return
    const [{ updaterId }] = data
    const userInfo = Object.assign({ id: updaterId }, users[updaterId!])
    appEvent.emit('MarkerLinked', data, userInfo)
  })

  ipc.on('MarkerTweaked', async (ids) => {
    const { data = [], users = {} } = await Apis.marker.listMarkerById({
      data: { markerIdList: ids },
    })
    if (!data.length)
      return
    const [{ updaterId }] = data
    const userInfo = Object.assign({ id: updaterId }, users[updaterId!])
    appEvent.emit('MarkerTweaked', data, userInfo)
  })

  ipc.on('MarkerUpdated', async (id) => {
    const { data: [markerInfo] = [], users = {} } = await Apis.marker.listMarkerById({
      data: { markerIdList: [id] },
    })
    if (!markerInfo)
      return
    const userInfo = Object.assign({ id: markerInfo.updaterId }, users[markerInfo.updaterId!])
    appEvent.emit('MarkerUpdated', markerInfo, userInfo)
  })

  // ==================== 公告 ====================
  ipc.on('NoticeAdded', async (id) => {
    appEvent.emit('NoticeAdded', id)
  })

  ipc.on('NoticeDeleted', (id) => {
    appEvent.emit('NoticeDeleted', id)
  })

  ipc.on('NoticeUpdated', (id) => {
    appEvent.emit('NoticeUpdated', id)
  })

  // ==================== 系统 ====================
  ipc.on('Pong', () => {
    appEvent.emit('Pong')
  })

  return {
    event: appEvent,
  }
}
