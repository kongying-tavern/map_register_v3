import { defineStore } from 'pinia'
import { useUserInfoStore } from '..'
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
  const { onMessage, ...rest } = useSocket<API.WSData, API.WSSentData>({
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

  const eventBus = new EventBus<API.WSEventMap>()

  onMessage((message) => {
    const { event, data } = message
    eventBus.emit(event, data)
  })

  return {
    event: eventBus,
    ...rest,
  }
})

userHook.onInfoChange(useSocketStore, (store) => {
  const { info } = useUserInfoStore()

  if (info.id === undefined) {
    store.close()
    return
  }

  const url = `${import.meta.env.VITE_WS_BASE}/${info.id}`
  store.connect(url)
})
