import type { EventBus } from '@/utils'

export const useMessageList = (messageEvent: EventBus<Socket.DataEventMap>) => {
  const _messageList = ref<Socket.DataEventRecord[]>([])

  messageEvent.on('MarkerAdded', (markerInfo, user) => {
    _messageList.value.push({
      key: crypto.randomUUID(),
      type: 'MarkerAdded',
      args: [markerInfo, user],
      time: new Date(markerInfo.createTime ?? 0).getTime(),
      user,
    })
  })

  messageEvent.on('MarkerUpdated', (markerInfo, user) => {
    _messageList.value.push({
      key: crypto.randomUUID(),
      type: 'MarkerUpdated',
      args: [markerInfo, user],
      time: new Date(markerInfo.updateTime ?? 0).getTime(),
      user,
    })
  })

  messageEvent.on('MarkerDeleted', (markerInfo, user) => {
    _messageList.value.push({
      key: crypto.randomUUID(),
      type: 'MarkerDeleted',
      args: [markerInfo, user],
      time: new Date(markerInfo.updateTime ?? 0).getTime(),
      user,
    })
  })

  messageEvent.on('MarkerTweaked', (markers, user) => {
    const [first] = markers
    _messageList.value.push({
      key: crypto.randomUUID(),
      type: 'MarkerTweaked',
      args: [markers, user],
      time: new Date(first.updateTime ?? 0).getTime(),
      user,
    })
  })

  messageEvent.on('MarkerLinked', (markers, user) => {
    const [first] = markers
    _messageList.value.push({
      key: crypto.randomUUID(),
      type: 'MarkerLinked',
      args: [markers, user],
      time: new Date(first.updateTime ?? 0).getTime(),
      user,
    })
  })

  return {
    messageList: _messageList as Readonly<Ref<Socket.DataEventRecord[]>>,
  }
}
