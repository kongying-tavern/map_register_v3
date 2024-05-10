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

export interface ConnectInitOptions {
  isReconnect?: boolean
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
  const _subject = shallowRef<WebSocketSubject<unknown>>()

  /** 订阅列表 */
  const _subscriptions = ref<Subscription[]>([])

  /** 消息 hook */
  const _messageHook = createEventHook<Recedived>()

  /** 连接主动关闭确认 promise */
  const _closedPromise = shallowRef<() => void>()

  /** 重连尝试次数 */
  const _retryCount = ref(0)

  /** 等待重连计时器 */
  const _retryTimer = ref<ReturnType<typeof globalThis.setTimeout>>()

  /** 连接状态清理 */
  const _clearSocket = () => {
    _subscriptions.value.forEach(subscription => subscription.unsubscribe())
    _subject.value = undefined
    _subscriptions.value = []
    delay.value = 0
  }

  /** 主动关闭连接 */
  const close = async () => {
    if (status.value === WebSocket.CLOSED)
      return
    await new Promise<void>((resolve) => {
      _closedPromise.value = resolve
      _subject.value?.complete()
    })
  }

  /** 主动发送消息 */
  const send = (message: Send) => {
    if (status.value !== WebSocket.OPEN)
      return
    _subject.value?.next(message)
    isSending.value = true
  }

  /** 连接初始化 */
  const _init = async (url: string, options: ConnectInitOptions = {}) => {
    const { isReconnect = false } = options

    const {
      count = 3,
      delay: retryDelay = 3000,
    } = typeof retry === 'object' ? retry : {}

    await close()

    // 如果不是重连操作，重置重连尝试次数和等待计时器
    if (!isReconnect) {
      globalThis.clearTimeout(_retryTimer.value)
      _retryCount.value = 0
    }

    status.value = WebSocket.CONNECTING
    logger.info(isReconnect ? `重新连接(${_retryCount.value}) ......` : '建立新连接 ......')

    const reconnect = () => {
      if (_retryCount.value >= count) {
        logger.error('已达到最大重连尝试上限')
        return
      }
      logger.info('等待重连')
      _retryTimer.value = globalThis.setTimeout(() => {
        _retryCount.value += 1
        _init(url, { isReconnect: true })
      }, retryDelay)
    }

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
          _clearSocket()
          _closedPromise.value?.()
          status.value = WebSocket.CLOSED
          logger.info('连接已关闭')
          reconnect()
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
          _subscriptions.value.push(subscription)
          return subscription
        }
        subscribe.bind(target)
        return subscribe
      },
    })

    // 消息处理
    ws.pipe(filter(messageFilter as (message: unknown) => boolean))
      .subscribe({
        next: (value) => {
          isReceving.value = true
          _messageHook.trigger(value as Recedived)
        },
        error: (err) => {
          logger.error(err instanceof Error ? err : `${err}`)
          _clearSocket()
          retry && reconnect()
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

    _subject.value = ws
  }

  /** 主动连接 */
  const connect = async (url: string) => {
    await _init(url)
  }

  return {
    isSending: isSending as Readonly<Ref<boolean>>,
    isReceving: isReceving as Readonly<Ref<boolean>>,
    delay: delay as Readonly<Ref<number>>,
    status: status as Readonly<Ref<number>>,
    onMessage: _messageHook.on,
    send,
    close,
    connect,
  }
}
