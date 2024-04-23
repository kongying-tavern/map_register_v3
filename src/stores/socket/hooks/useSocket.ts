import type { Subscription } from 'rxjs'
import { filter } from 'rxjs'
import { WebSocketSubject } from 'rxjs/webSocket'
import type { Logger } from '@/utils'

export interface SocketHookOptions<T, V> {
  logger: Logger
  immediate?: boolean
  pingInterval: number
  pingMessage: V
  pongFilter: (message: T) => boolean
  messageFilter: (message: T) => boolean
  retry?: {
    /** @default 3000 */
    delay?: number
    /** @default 3 */
    count?: number
  } | true
}

export const useSocket = <Recedived, Send>(options: SocketHookOptions<Recedived, Send>) => {
  const {
    logger,
    pingInterval,
    pingMessage,
    pongFilter,
    messageFilter,
    retry,
  } = options

  /** 连接状态 */
  const status = ref<number>(WebSocket.CLOSED)

  /** 是否正在发送消息 */
  const isSending = autoResetRef(false, 1000)

  /** 是否正在接收消息 */
  const isReceving = autoResetRef(false, 1000)

  /** 网络时延（通过心跳检测，ms） */
  const delay = ref(0)

  /** 连接实例 */
  const subject = shallowRef<WebSocketSubject<unknown>>()

  /** 订阅列表 */
  const subscriptions = ref<Subscription[]>([])

  /** 消息 hook */
  const messageHook = createEventHook<Recedived>()

  /** 连接状态清理 */
  const clearSocket = () => {
    subscriptions.value.forEach(subscription => subscription.unsubscribe())
    subject.value = undefined
    subscriptions.value = []
    delay.value = 0
  }

  const close = () => {
    subject.value?.complete()
    clearSocket()
  }

  const send = (message: Send) => {
    if (status.value !== WebSocket.OPEN)
      return
    subject.value?.next(message)
    isSending.value = true
  }

  const _retryCount = ref(0)

  const _init = (url: string) => {
    close()

    status.value = WebSocket.CONNECTING
    logger.info('连接中 ......')

    // 连接初始化
    const newSubject = new WebSocketSubject<unknown>({
      url,
      openObserver: {
        next: () => {
          status.value = WebSocket.OPEN
          logger.info('连接已建立')
          newSubject.next(pingMessage)
          _retryCount.value = 0
        },
      },
      closingObserver: {
        next: () => {
          status.value = WebSocket.CLOSING
          logger.info('正在关闭连接 ......')
        },
      },
      closeObserver: {
        next: () => {
          status.value = WebSocket.CLOSED
          logger.info('连接已关闭')
        },
      },
    })

    // 拦截订阅操作以便后续清除
    const ws = new Proxy(newSubject, {
      get(target, prop, receiver) {
        let value = Reflect.get(target, prop, receiver)
        if (typeof value === 'function')
          value = value.bind(target)
        if (prop !== 'subscribe')
          return value
        const subscribe = function (...args: unknown[]) {
          const subscription = value(...args)
          subscriptions.value.push(subscription)
          return subscription
        }
        subscribe.bind(target)
        return subscribe
      },
    })

    const reconnect = () => {
      const {
        count = 3,
        delay = 3000,
      } = typeof retry === 'object' ? retry : {}
      if (_retryCount.value >= count) {
        logger.error('已达到最大重连尝试上限')
        return
      }
      logger.info('等待重连')
      globalThis.setTimeout(() => {
        _retryCount.value += 1
        logger.info('尝试重连')
        _init(url)
      }, delay)
    }

    // 消息处理
    ws.pipe(filter(messageFilter as (message: unknown) => boolean))
      .subscribe({
        next: (value) => {
          isReceving.value = true
          messageHook.trigger(value as Recedived)
        },
        error: () => {
          logger.error(`连接错误, 尝试重连 ...`)
          clearSocket()
          retry && reconnect()
        },
        complete: () => {
          clearSocket()
        },
      })

    let heartBeatTimer: ReturnType<typeof globalThis.setTimeout>
    let heartStartTime = Date.now()

    // 心跳处理
    ws.pipe(filter(pongFilter as (message: unknown) => boolean))
      .subscribe({
        next: () => {
          delay.value = Date.now() - heartStartTime
          heartBeatTimer = globalThis.setTimeout(() => {
            heartStartTime = Date.now()
            ws.next(pingMessage)
          }, pingInterval)
        },
        error: () => {
          globalThis.clearTimeout(heartBeatTimer)
        },
        complete: () => {
          globalThis.clearTimeout(heartBeatTimer)
        },
      })

    subject.value = ws
  }

  const connect = (url: string) => {
    _init(url)
  }

  return {
    isSending,
    isReceving,
    delay,
    status,
    onMessage: messageHook.on,
    send,
    close,
    connect,
  }
}
