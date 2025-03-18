import type { WS } from '@/worker/webSocket/types'
import { useState } from '@/hooks'
import { SocketCloseReason, SocketStatus, SocketWorkerEvent } from '@/shared'
import { EventBus, Logger } from '@/utils'
import SocketWorkerURL from '@/worker/webSocket/socket.worker?worker&url'
import { filter, fromEvent, map, tap } from 'rxjs'

const logger = new Logger('Socket')

export const useSocket = (options: SocketHookOptions) => {
  const { getURL } = options

  const isSending = ref(false)
  const isReceving = ref(false)
  const [delay, setDelay] = useState(0)
  const [status, setStatus] = useState<SocketStatus>(SocketStatus.CLOSED)

  const socketEvent = new EventBus<API.WSEventMap>()

  const openHook = createEventHook<void>()
  const closeHook = createEventHook<void>()

  const socketWorker = new ('SharedWorker' in globalThis ? SharedWorker : Worker)(SocketWorkerURL, {
    type: 'module',
    name: 'Socket 工作线程',
  })

  const messageTarget = (() => {
    // HACK 兼容移动端 Chrome
    const type = Object.prototype.toString.call(socketWorker)
    if (type === '[object SharedWorker]') {
      ;(<SharedWorker>socketWorker).port.start()
      return (<SharedWorker>socketWorker).port
    }
    return socketWorker as Worker
  })()

  const message$ = fromEvent<MessageEvent<WS.Message>>(messageTarget, 'message')

  message$.pipe(
    filter(({ data }) => data.event === SocketWorkerEvent.StatusChange),
    map(({ data }) => data.data as unknown as number),
    tap((newStatus) => {
      if (newStatus === SocketStatus.CLOSED)
        closeHook.trigger()
    }),
  ).subscribe(setStatus)

  message$.pipe(
    filter(({ data }) => data.event === SocketWorkerEvent.DelayChange),
    map(({ data }) => data.data as unknown as number),
  ).subscribe(setDelay)

  const data$ = message$.pipe(
    filter(({ data }) => data.event === SocketWorkerEvent.Message),
    map(({ data }) => data.data as unknown as API.WSData),
  )

  data$.pipe(
    tap((data) => {
      logger.info('message', data)
    }),
  ).subscribe(({ event, data }) => {
    ;(socketEvent as EventBus<Record<string, unknown>>).emit(event, data)
  })

  const send = <T extends SocketWorkerEvent>(message: Omit<WS.Message<T>, 'id' | 'message'>, transfer: Transferable[] = []) => {
    const id = crypto.randomUUID()
    messageTarget.postMessage({ ...message, id }, transfer)
  }

  fromEvent<BeforeUnloadEvent>(window, 'beforeunload').pipe(
    tap(() => send({
      event: SocketWorkerEvent.Unload,
      data: undefined,
    })),
  ).subscribe()

  const close = () => send({
    event: SocketWorkerEvent.Close,
    data: {
      code: 1000,
      reason: SocketCloseReason.CLOSED_BY_USER,
    },
  })

  const open = () => {
    const url = getURL()
    if (!url)
      return
    send({ event: SocketWorkerEvent.Open, data: url })
  }

  return {
    isSending: isSending as Readonly<Ref<boolean>>,
    isReceving: isReceving as Readonly<Ref<boolean>>,
    delay: delay as Readonly<Ref<number>>,
    status: status as Readonly<Ref<number>>,
    data$,
    socketEvent,
    onOpen: openHook.on,
    onClose: closeHook.on,
    send,
    close,
    open,
  }
}
