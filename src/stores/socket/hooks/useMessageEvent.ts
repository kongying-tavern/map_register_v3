import type { EventHookOn } from '@vueuse/core'
import { EventBus } from '@/utils'
import Api from '@/api/api'
import { HistoryRecordType } from '@/shared'

type MessageEventStrategy = {
  [K in keyof API.WSEventMap]: (...args: API.WSEventMap[K]) => void
}

export const useMessageEvent = (onMessage: EventHookOn<API.WSData<keyof API.WSEventMap>>) => {
  const _eventBus = new EventBus<Socket.DataEventMap>()

  const strategyMap: MessageEventStrategy = {
    AppUpdated: () => {
      _eventBus.emit('AppUpdated')
    },

    IconTagBinaryPurged: () => {
      _eventBus.emit('IconTagBinaryPurged')
    },

    ItemBinaryPurged: () => {
      _eventBus.emit('ItemBinaryPurged')
    },

    MarkerAdded: async (id) => {
      const { data: [markerInfo] = [], users = {} } = await Api.marker.listMarkerById([id])
      if (!markerInfo)
        return
      const userInfo = Object.assign({ id: markerInfo.creatorId }, users[markerInfo.creatorId!])
      _eventBus.emit('MarkerAdded', markerInfo, userInfo)
    },

    MarkerBinaryPurged: () => {
      _eventBus.emit('MarkerBinaryPurged')
    },

    MarkerDeleted: async (id) => {
      const { data: { record: [history] = [] } = {}, users = {} } = await Api.history.searchHistory({
        current: 0,
        id: [id],
        size: 1,
        type: HistoryRecordType.MARKER,
        sort: ['updateTime-'],
      })
      const markerInfo = JSON.parse(history.content!) as API.MarkerVo
      const userInfo = Object.assign({ id: history.creatorId }, users[history.creatorId!])
      _eventBus.emit('MarkerDeleted', markerInfo, userInfo)
    },

    MarkerLinkageBinaryPurged: () => {
      _eventBus.emit('MarkerLinkageBinaryPurged')
    },

    MarkerLinked: async ({ markers: ids }) => {
      const { data = [], users = {} } = await Api.marker.listMarkerById(ids)
      if (!data.length)
        return
      const [{ updaterId }] = data
      const userInfo = Object.assign({ id: updaterId }, users[updaterId!])
      _eventBus.emit('MarkerLinked', data, userInfo)
    },

    MarkerTweaked: async (ids) => {
      const { data = [], users = {} } = await Api.marker.listMarkerById(ids)
      if (!data.length)
        return
      const [{ updaterId }] = data
      const userInfo = Object.assign({ id: updaterId }, users[updaterId!])
      _eventBus.emit('MarkerTweaked', data, userInfo)
    },

    MarkerUpdated: async (id) => {
      const { data: [markerInfo] = [], users = {} } = await Api.marker.listMarkerById([id])
      if (!markerInfo)
        return
      const userInfo = Object.assign({ id: markerInfo.updaterId }, users[markerInfo.updaterId!])
      _eventBus.emit('MarkerUpdated', markerInfo, userInfo)
    },

    NoticeAdded: async (id) => {
      _eventBus.emit('NoticeAdded', id)
    },

    NoticeDeleted: (id) => {
      _eventBus.emit('NoticeDeleted', id)
    },

    NoticeUpdated: (id) => {
      _eventBus.emit('NoticeUpdated', id)
    },

    Pong: () => {
      _eventBus.emit('Pong')
    },

    UserKickedOut: () => {
      _eventBus.emit('UserKickedOut')
    },
  }

  onMessage(({ event, data }) => {
    const strategy = strategyMap[event]
    if (!strategy)
      return
    void (strategy as unknown as ((...args: unknown[]) => void))(data)
  })

  return {
    event: _eventBus,
  }
}
