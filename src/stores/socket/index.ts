import { defineStore } from 'pinia'
import { ElNotification } from 'element-plus'
import { usePreferenceStore, useUserInfoStore } from '..'
import { userHook } from '../hooks'
import { useSocket } from './hooks'
import { EventBus, Logger } from '@/utils'

const logger = new Logger('Socket')

const isReceivedData = (v: unknown): v is API.WSData => {
  if (typeof v !== 'object')
    return false
  if (v === null)
    return false
  if (!('event' in v))
    return false
  return true
}

/** WebSocket 状态管理 */
export const useSocketStore = defineStore('global-web-socket', () => {
  const preferenceStore = usePreferenceStore()

  const _noticeEvents = computed(() => new Set(preferenceStore.preference['socket.setting.noticeEvents']))

  const notice = (key: API.WSEventType, ...options: Parameters<typeof ElNotification>) => {
    if (!_noticeEvents.value.has(key))
      return
    return ElNotification(...options)
  }

  const { onMessage, connect: _connect, close: _close, ...rest } = useSocket<API.WSData, API.WSSentData>({
    logger,
    pingInterval: 5000,
    pingMessage: {
      action: 'Ping',
    },
    retry: {
      count: 3,
      delay: 5000,
    },
    pongFilter: message => isReceivedData(message) && message.event === 'Pong',
    messageFilter: message => isReceivedData(message) && message.event !== 'Pong',
  })

  const _userId = ref<number>()

  const connect = async (userId?: number) => {
    if (userId === undefined) {
      _close()
      return
    }
    const url = `${import.meta.env.VITE_WS_BASE}/${userId}`
    await _connect(url)
    _userId.value = userId
  }

  const eventBus = new EventBus<API.WSEventMap>()

  onMessage((message) => {
    const { event, data } = message
    eventBus.emit(event, data)
  })

  return {
    event: eventBus,
    userId: _userId as Readonly<Ref<number | undefined>>,
    notice,
    connect,
    close: _close,
    ...rest,
  }
})

userHook.onInfoChange(useSocketStore, (store) => {
  const { info } = useUserInfoStore()

  if (info.id === undefined) {
    store.close()
    return
  }

  if (store.status !== WebSocket.OPEN || info.id !== store.userId)
    store.connect(info.id)
})
