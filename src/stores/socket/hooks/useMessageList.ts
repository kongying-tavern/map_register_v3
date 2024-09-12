import type { EventBus } from '@/utils'

export const useMessageList = (messageEvent: EventBus<Socket.DataEventMap>) => {
  const _messageList = ref<Socket.DataEventRecord[]>([])

  messageEvent.on('MarkerAdded', (markerInfo, user) => {
    _messageList.value.push({
      key: crypto.randomUUID(),
      type: 'MarkerAdded',
      args: [markerInfo, user],
      time: Date.now(),
      user,
    })
  })

  return {
    messageList: _messageList as Readonly<Ref<Socket.DataEventRecord[]>>,
  }
}
