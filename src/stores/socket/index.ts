import { ElNotification } from 'element-plus'
import { defineStore } from 'pinia'
import { useArchiveStore, useUserStore } from '..'
import { useAppEvent, useMessageList, useSocket } from './hooks'

/** WebSocket 状态管理 */
export const useSocketStore = defineStore('socket', () => {
  const archiveStore = useArchiveStore()
  const userStore = useUserStore()

  const noticeEvents = computed(() => {
    return new Set(archiveStore.currentArchive.body.Preference['socket.setting.noticeEvents'])
  })

  const notice = (key: API.WSEventType, ...options: Parameters<typeof ElNotification>) => {
    if (!noticeEvents.value.has(key))
      return
    ElNotification(...options)
  }

  const {
    context,
    ipc,
    socketEvent,
    open,
    close,
  } = useSocket()

  ipc.on('AppUpdated', () => {
    ElNotification.warning({
      title: '系统提示',
      message: '应用已更新，页面将在 5 分钟后重载。',
      duration: 0,
    })
    window.setTimeout(() => {
      window.location.replace(`${window.location.origin}?t=${Date.now()}`)
    }, 5 * 60 * 1000)
  })

  ipc.on('UserKickedOut', () => {
    ElNotification.error({
      title: '系统提示',
      message: '您已被管理员强制下线。',
      duration: 0,
    })
    userStore.logout()
  })

  const { event: appEvent } = useAppEvent(ipc)
  const { messageList, clearMessageList } = useMessageList(appEvent)

  watch(() => userStore.info?.id, (newUserId, oldUserId) => {
    if (newUserId === undefined) {
      close()
      return
    }
    if (newUserId === oldUserId)
      return
    open()
  }, { immediate: true })

  return {
    context,
    ipc,
    socketEvent,
    appEvent,
    messageList,
    clearMessageList,
    notice,
    connect: open,
    close,
  }
})
