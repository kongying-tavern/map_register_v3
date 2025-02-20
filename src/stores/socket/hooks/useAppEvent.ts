import { EventBus } from '@/utils'
import Api from '@/api/api'
import { HistoryRecordType } from '@/shared'

export const useAppEvent = (socketEvent: EventBus<API.WSEventMap>) => {
  const appEvent = new EventBus<Socket.DataEventMap>()

  // ==================== 应用 ====================
  socketEvent.on('AppUpdated', () => {
    appEvent.emit('AppUpdated')
  })

  socketEvent.on('UserKickedOut', () => {
    appEvent.emit('UserKickedOut')
  })

  // ==================== 图标 ====================
  socketEvent.on('IconTagBinaryPurged', () => {
    appEvent.emit('IconTagBinaryPurged')
  })

  // ==================== 物品 ====================
  socketEvent.on('ItemAdded', async (id) => {
    const { data: [itemInfo] = [], users = {} } = await Api.item.listItemById([id])
    if (!itemInfo)
      return
    const userInfo = Object.assign({ id: itemInfo.creatorId }, users[itemInfo.creatorId!])
    appEvent.emit('ItemAdded', itemInfo, userInfo)
  })

  socketEvent.on('ItemUpdated', async (id) => {
    const { data: [itemInfo] = [], users = {} } = await Api.item.listItemById([id])
    if (!itemInfo)
      return
    const userInfo = Object.assign({ id: itemInfo.creatorId }, users[itemInfo.creatorId!])
    appEvent.emit('ItemUpdated', itemInfo, userInfo)
  })

  socketEvent.on('ItemDeleted', async (id) => {
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

  socketEvent.on('ItemBinaryPurged', () => {
    appEvent.emit('ItemBinaryPurged')
  })

  // ==================== 点位 ====================
  socketEvent.on('MarkerAdded', async (id) => {
    const { data: [markerInfo] = [], users = {} } = await Api.marker.listMarkerById([id])
    if (!markerInfo)
      return
    const userInfo = Object.assign({ id: markerInfo.creatorId }, users[markerInfo.creatorId!])
    appEvent.emit('MarkerAdded', markerInfo, userInfo)
  })

  socketEvent.on('MarkerBinaryPurged', () => {
    appEvent.emit('MarkerBinaryPurged')
  })

  socketEvent.on('MarkerDeleted', async (id) => {
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

  socketEvent.on('MarkerLinkageBinaryPurged', () => {
    appEvent.emit('MarkerLinkageBinaryPurged')
  })

  socketEvent.on('MarkerLinked', async ({ markers: ids }) => {
    const { data = [], users = {} } = await Api.marker.listMarkerById(ids)
    if (!data.length)
      return
    const [{ updaterId }] = data
    const userInfo = Object.assign({ id: updaterId }, users[updaterId!])
    appEvent.emit('MarkerLinked', data, userInfo)
  })

  socketEvent.on('MarkerTweaked', async (ids) => {
    const { data = [], users = {} } = await Api.marker.listMarkerById(ids)
    if (!data.length)
      return
    const [{ updaterId }] = data
    const userInfo = Object.assign({ id: updaterId }, users[updaterId!])
    appEvent.emit('MarkerTweaked', data, userInfo)
  })

  socketEvent.on('MarkerUpdated', async (id) => {
    const { data: [markerInfo] = [], users = {} } = await Api.marker.listMarkerById([id])
    if (!markerInfo)
      return
    const userInfo = Object.assign({ id: markerInfo.updaterId }, users[markerInfo.updaterId!])
    appEvent.emit('MarkerUpdated', markerInfo, userInfo)
  })

  // ==================== 公告 ====================
  socketEvent.on('NoticeAdded', async (id) => {
    appEvent.emit('NoticeAdded', id)
  })

  socketEvent.on('NoticeDeleted', (id) => {
    appEvent.emit('NoticeDeleted', id)
  })

  socketEvent.on('NoticeUpdated', (id) => {
    appEvent.emit('NoticeUpdated', id)
  })

  // ==================== 系统 ====================
  socketEvent.on('Pong', () => {
    appEvent.emit('Pong')
  })

  return {
    event: appEvent,
  }
}
