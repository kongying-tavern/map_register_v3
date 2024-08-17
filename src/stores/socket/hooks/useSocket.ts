import { template } from 'lodash'
import { filter, fromEvent, map, tap } from 'rxjs'
import { Logger } from '@/utils'
import SocketWorkerURL from '@/worker/webSocket/socket.worker?url'
import { SocketCloseReason, SocketWorkerEvent } from '@/shared'
import type { WS } from '@/worker/webSocket/types'
import { useState } from '@/hooks'

const logger = new Logger('Socket')

export const useSocket = (templatedUrl: string, options: SocketHookOptions) => {
  const {
    params,
    query,
  } = options

  const isSending = ref(false)
  const isReceving = ref(false)
  const [delay, setDelay] = useState(0)
  const [status, setStatus] = useState<number>(WebSocket.CLOSED)

  const socketEventHook = createEventHook<API.WSData>()
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
      (socketWorker as SharedWorker).port.start()
      return (socketWorker as SharedWorker).port
    }
    return socketWorker as Worker
  })()

  const message$ = fromEvent<MessageEvent<WS.Message>>(messageTarget, 'message')

  message$.pipe(
    filter(({ data }) => data.event === SocketWorkerEvent.StatusChange),
    map(({ data }) => data.data as unknown as number),
    tap((newStatus) => {
      if (newStatus === WebSocket.CLOSED)
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
  ).subscribe(socketEventHook.trigger)

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
    let url = templatedUrl

    if (params) {
      const complied = template(url, { interpolate: /\{([\s\S]+?)\}/g })
      url = complied(params())
    }

    const urlWithQuery = new URL(url)

    if (query) {
      Object.entries(query()).forEach(([key, value]) => {
        urlWithQuery.searchParams.append(key, `${value}`)
      })
    }

    url = urlWithQuery.toString()

    send({ event: SocketWorkerEvent.Open, data: url })
  }

  return {
    isSending: isSending as Readonly<Ref<boolean>>,
    isReceving: isReceving as Readonly<Ref<boolean>>,
    delay: delay as Readonly<Ref<number>>,
    status: status as Readonly<Ref<number>>,
    data$,
    onMessage: socketEventHook.on,
    onOpen: openHook.on,
    onClose: closeHook.on,
    send,
    close,
    open,
  }
}
