import { defineStore } from 'pinia'
import { ElNotification } from 'element-plus'
import { usePreferenceStore, useUserInfoStore } from '..'
import { userHook } from '../hooks'
import { useSocket } from './hooks'
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
    ...rest
  } = useSocket(`${import.meta.env.VITE_WS_BASE}/{userId}`, {
    params: () => ({
      userId: useUserInfoStore().info.id,
    }),
  })

  const connect = async (userId?: number) => {
    if (userId === undefined)
      return close()
    _userId.value = userId
    open()
  }

  onMessage((message) => {
    const { event, data } = message
    _eventBus.emit(event, data)
  })

  return {
    event: _eventBus,
    userId: _userId as Readonly<Ref<number | undefined>>,
    notice,
    connect,
    close,
    onOpen,
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
