import type { EventBus } from '@/utils'
import db from '@/database'

export const useMessageList = (messageEvent: EventBus<Socket.DataEventMap>) => {
  const _messageList = ref<Socket.DataEventRecord[]>([])

  const afterInit = db.websocketEvents.orderBy('time').reverse().limit(100).toArray().then((record) => {
    _messageList.value = record
  })

  messageEvent.on('MarkerAdded', async (markerInfo, user) => {
    await afterInit
    const data: Socket.DataEventRecord<'MarkerAdded'> = {
      key: crypto.randomUUID(),
      type: 'MarkerAdded',
      args: [markerInfo, user],
      time: new Date(markerInfo.createTime ?? 0).getTime(),
      user,
    }
    await db.websocketEvents.add(JSON.parse(JSON.stringify(data)))
    _messageList.value.push(data)
  })

  messageEvent.on('MarkerUpdated', async (markerInfo, user) => {
    await afterInit
    const data: Socket.DataEventRecord<'MarkerUpdated'> = {
      key: crypto.randomUUID(),
      type: 'MarkerUpdated',
      args: [markerInfo, user],
      time: new Date(markerInfo.updateTime ?? 0).getTime(),
      user,
    }
    await db.websocketEvents.add(JSON.parse(JSON.stringify(data)))
    _messageList.value.push(data)
  })

  messageEvent.on('MarkerDeleted', async (markerInfo, user) => {
    await afterInit
    const data: Socket.DataEventRecord<'MarkerDeleted'> = {
      key: crypto.randomUUID(),
      type: 'MarkerDeleted',
      args: [markerInfo, user],
      time: new Date(markerInfo.updateTime ?? 0).getTime(),
      user,
    }
    await db.websocketEvents.add(JSON.parse(JSON.stringify(data)))
    _messageList.value.push(data)
  })

  messageEvent.on('MarkerTweaked', async (markers, user) => {
    await afterInit
    const [first] = markers
    const data: Socket.DataEventRecord<'MarkerTweaked'> = {
      key: crypto.randomUUID(),
      type: 'MarkerTweaked',
      args: [markers, user],
      time: new Date(first.updateTime ?? 0).getTime(),
      user,
    }
    await db.websocketEvents.add(JSON.parse(JSON.stringify(data)))
    _messageList.value.push(data)
  })

  messageEvent.on('MarkerLinked', async (markers, user) => {
    await afterInit
    const [first] = markers
    const data: Socket.DataEventRecord<'MarkerLinked'> = {
      key: crypto.randomUUID(),
      type: 'MarkerLinked',
      args: [markers, user],
      time: new Date(first.updateTime ?? 0).getTime(),
      user,
    }
    await db.websocketEvents.add(JSON.parse(JSON.stringify(data)))
    _messageList.value.push(data)
  })

  return {
    messageList: _messageList as Readonly<Ref<Socket.DataEventRecord[]>>,
  }
}
