import { ElNotification } from 'element-plus'
import { defineStore } from 'pinia'
import { useArchiveStore, useUserStore } from '..'
import { useAppEvent, useMessageList, useSocket } from './hooks'

/** WebSocket 状态管理 */
export const useSocketStore = defineStore('global-web-socket', () => {
  const archiveStore = useArchiveStore()
  const userStore = useUserStore()

  const _noticeEvents = computed(() => {
    return new Set(archiveStore.currentArchive.body.Preference['socket.setting.noticeEvents'])
  })

  const _userId = ref<number>()

  const notice = (key: API.WSEventType, ...options: Parameters<typeof ElNotification>) => {
    if (!_noticeEvents.value.has(key))
      return
    ElNotification(...options)
  }

  const {
    socketEvent,
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

  const { event: appEvent } = useAppEvent(socketEvent)

  appEvent.on('AppUpdated', () => {
    ElNotification.warning({
      title: '系统提示',
      message: '应用已更新，页面将在 5 分钟后重载。',
      duration: 0,
    })
    window.setTimeout(() => {
      window.location.reload()
    }, 5 * 60 * 1000)
  })

  appEvent.on('UserKickedOut', () => {
    ElNotification.error({
      title: '系统提示',
      message: '您已被管理员强制下线。',
      duration: 0,
    })
    userStore.logout()
  })

  const { messageList, clearMessageList } = useMessageList(appEvent)

  const connect = async (userId?: number) => {
    if (userId === undefined)
      return close()
    _userId.value = userId
    open()
  }

  onClose(() => {
    _userId.value = undefined
  })

  watch(() => userStore.info?.id, (userId) => {
    if (userId === undefined) {
      close()
      return
    }
    _userId.value = userId
    open()
  }, { immediate: true })

  return {
    userId: _userId as Readonly<Ref<number | undefined>>,
    socketEvent,
    appEvent,
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
