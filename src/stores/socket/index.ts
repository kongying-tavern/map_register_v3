import { defineStore } from 'pinia'
import { ElNotification } from 'element-plus'
import { usePreferenceStore, useUserInfoStore } from '..'
import { userHook } from '../hooks'
import { useMessageEvent, useMessageList, useSocket } from './hooks'
import { EventBus } from '@/utils'

/** WebSocket 状态管理 */
export const useSocketStore = defineStore('global-web-socket', () => {
  const preferenceStore = usePreferenceStore()

  const _noticeEvents = computed(() => new Set(preferenceStore.preference['socket.setting.noticeEvents']))
  const _userId = ref<number>()
  const _eventBus = new EventBus<API.WSEventMap>()

  const notice = (key: API.WSEventType, ...options: Parameters<typeof ElNotification>) => {
    if (!_noticeEvents.value.has(key))
      return
    return ElNotification(...options)
  }

  const {
    onMessage,
    open,
    close,
    onOpen,
    onClose,
    status,
    ...rest
  } = useSocket(`${import.meta.env.VITE_WS_BASE}/{userId}`, {
    params: () => ({
      userId: useUserInfoStore().info.id,
    }),
  })

  const { event: messageEvent } = useMessageEvent(onMessage)
  const { messageList } = useMessageList(messageEvent)

  const connect = async (userId?: number) => {
    if (userId === undefined)
      return close()
    _userId.value = userId
    open()
  }

  onClose(() => {
    _userId.value = undefined
  })

  const statusHandler: Record<number, () => void> = {
    [WebSocket.CLOSED]: () => ElNotification({
      title: 'Error',
      message: 'WebSocket 连接已断开',
      type: 'error',
      offset: 48,
    }),
    [WebSocket.OPEN]: () => ElNotification({
      title: 'Success',
      message: 'WebSocket 已连接',
      type: 'success',
      offset: 48,
    }),
  }

  watch(status, (newStatus, oldStatus) => {
    if (newStatus === oldStatus)
      return
    statusHandler[newStatus]?.()
  })

  return {
    event: _eventBus,
    userId: _userId as Readonly<Ref<number | undefined>>,
    messageList,
    status,
    notice,
    connect,
    close,
    onOpen,
    onClose,
    ...rest,
  }
})

userHook.onInfoChange(useSocketStore, (store) => {
  const { info } = useUserInfoStore()

  if (info.id === undefined) {
    store.close()
    return
  }

  if (info.id !== store.userId)
    store.connect(info.id)
})
