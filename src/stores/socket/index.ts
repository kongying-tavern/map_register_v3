import { defineStore } from 'pinia'
import { ElNotification, type NotificationHandle } from 'element-plus'
import { useArchiveStore, useUserStore } from '..'
import { useMessageEvent, useMessageList, useSocket } from './hooks'
import { EventBus } from '@/utils'

/** WebSocket 状态管理 */
export const useSocketStore = defineStore('global-web-socket', () => {
  const archiveStore = useArchiveStore()
  const userStore = useUserStore()

  const _noticeEvents = computed(() => {
    return new Set(archiveStore.currentArchive.body.Preference['socket.setting.noticeEvents'])
  })

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
      userId: userStore.info?.id,
    }),
  })

  const { event: messageEvent } = useMessageEvent(onMessage)
  const { messageList, clearMessageList } = useMessageList(messageEvent)

  const connect = async (userId?: number) => {
    if (userId === undefined)
      return close()
    _userId.value = userId
    open()
  }

  onClose(() => {
    _userId.value = undefined
  })

  const socketNotice = shallowRef<NotificationHandle>()

  const statusHandler: Record<number, () => void> = {
    [WebSocket.CLOSED]: () => {
      socketNotice.value?.close()
      socketNotice.value = ElNotification({
        title: 'Error',
        message: 'WebSocket 连接已断开',
        type: 'error',
      })
    },
    [WebSocket.CONNECTING]: () => {
      socketNotice.value?.close()
      socketNotice.value = ElNotification({
        title: 'Info',
        message: '正在建立 WebSocket 连接',
        type: 'info',
        onClose: () => {},
      })
    },
    [WebSocket.OPEN]: () => {
      socketNotice.value?.close()
      socketNotice.value = ElNotification({
        title: 'Success',
        message: 'WebSocket 已连接',
        type: 'success',
      })
    },
  }

  watch(status, (newStatus, oldStatus) => {
    if (newStatus === oldStatus)
      return
    statusHandler[newStatus]?.()
  })

  watch(() => userStore.info?.id, (userId) => {
    if (userId === undefined) {
      close()
      return
    }
    _userId.value = userId
    open()
  })

  return {
    event: _eventBus,
    userId: _userId as Readonly<Ref<number | undefined>>,
    messageEvent,
    messageList,
    status,
    clearMessageList,
    notice,
    connect,
    close,
    onOpen,
    onClose,
    ...rest,
  }
})
