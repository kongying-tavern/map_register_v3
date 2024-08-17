import { EMPTY, defer, filter, fromEvent, map, of, race, repeat, switchMap, take, takeUntil, tap, timer } from 'rxjs'
import type { WS } from './types'
import { SocketCloseReason, SocketWorkerEvent } from '@/shared/socket'
import { EventBus } from '@/utils/EventBus'

export enum SocketAction {
  /** 心跳 */
  Ping = 'Ping',
}

declare const globalThis: (SharedWorkerGlobalScope | DedicatedWorkerGlobalScope)

/** 连接配置。出于稳定性考虑，连接参数不再通过运行时确定。 */
const OPTIONS = {
  /** 心跳包 */
  HEARTBEAT: {
    /** 心跳包发送间隔 */
    INTERVAL: 30000,
    /** 超时判定时间 */
    TIMEOUT: 30000,
  },
  /** 断线重连 */
  RECONNECT: {
    /** 重连等待时间 */
    DELAY: 3000,
  },
}

// ==================== state ====================

interface MessageTarget {
  postMessage: (data: unknown, transfer: Transferable[]) => void
  close: () => void
}

/** 用于维护 port 连接 */
const ports = new Map<string, MessageTarget>()

/** 事件总线 */
const workerEvent = new EventBus<WS.WorkerEventMap>()

/** 向所有页面广播消息 */
const broadcast = <T extends SocketWorkerEvent>(message: Omit<WS.Message<T>, 'id'>, transfer: Transferable[] = []) => {
  ports.forEach((port) => {
    port.postMessage(message, transfer)
  })
}

const ws = new class SocketObservable extends EventTarget {
  #instance?: WebSocket
  get instance() {
    return this.#instance
  }

  #promiseToOpen?: Promise<WebSocket | undefined>
  #promiseToClosed?: Promise<CloseEvent>
  #eventListeners = new Map<string, Map<EventListener, EventListenerOptions | undefined>>()

  addEventListener = (type: string, callback: EventListener, options?: EventListenerOptions): void => {
    if (!this.#eventListeners.has(type))
      this.#eventListeners.set(type, new Map<EventListener, EventListenerOptions | undefined>())
    const callbacks = this.#eventListeners.get(type)!
    callbacks.set(callback, options)
    super.addEventListener(type, callback, options)
    if (this.#instance)
      this.#instance.addEventListener(type, callback, options)
  }

  removeEventListener = (type: string, callback: EventListener, options?: EventListenerOptions): void => {
    if (!this.#eventListeners.has(type))
      return
    const callbacks = this.#eventListeners.get(type)!
    callbacks.delete(callback)
    super.removeEventListener(type, callback, options)
    if (this.#instance)
      this.#instance.removeEventListener(type, callback, options)
  }

  open = async (url: string) => {
    if (this.#instance) {
      if (this.#instance.url !== url)
        await this.close(SocketCloseReason.URL_CHANGED)
      else if (this.#instance.readyState === WebSocket.OPEN)
        return this.#instance
      else if (this.#promiseToOpen)
        return await this.#promiseToOpen
    }

    const { resolve, promise } = Promise.withResolvers<WebSocket | undefined>()

    this.#promiseToOpen = promise

    broadcast({
      event: SocketWorkerEvent.StatusChange,
      data: WebSocket.CONNECTING,
    })

    const newSocket = new WebSocket(url)

    this.#instance = newSocket

    this.#eventListeners.forEach((listeners, type) => {
      listeners.forEach((options, callback) => {
        newSocket.addEventListener(type, callback, options)
      })
    })

    newSocket.addEventListener('open', () => {
      this.#promiseToOpen = undefined
      resolve(newSocket)
    }, { once: true })

    newSocket.addEventListener('error', () => {
      this.#promiseToOpen = undefined
      resolve(undefined)
    }, { once: true })

    return promise
  }

  reconnect = async () => {
    if (!this.#instance)
      return

    if (this.#instance.readyState === WebSocket.OPEN)
      return this.#instance

    if (this.#promiseToOpen)
      return await this.#promiseToOpen

    await this.open(this.#instance.url)
  }

  close = async (reason?: SocketCloseReason) => {
    if (!this.#instance || this.#instance.readyState === WebSocket.CLOSED)
      return

    if (this.#promiseToClosed)
      return await this.#promiseToClosed

    const { resolve, promise } = Promise.withResolvers<CloseEvent>()

    this.#promiseToClosed = promise

    this.#instance.addEventListener('close', (ev) => {
      this.#promiseToClosed = undefined
      resolve(ev)
    }, { once: true })

    broadcast({
      event: SocketWorkerEvent.StatusChange,
      data: WebSocket.CLOSING,
    })

    this.#instance.close(1000, reason)

    return await promise
  }

  send = <T>(data: API.WSSentData<T>) => {
    if (!this.#instance || this.#instance.readyState !== WebSocket.OPEN)
      return
    this.#instance.send(JSON.stringify(data))
  }
}()

const open$ = fromEvent(ws, 'open')
const close$ = fromEvent<CloseEvent>(ws, 'close')
const message$ = fromEvent<MessageEvent<string>>(ws, 'message').pipe(
  map(({ data }) => JSON.parse(data) as API.WSData),
)

open$.pipe(
  tap(() => broadcast({
    event: SocketWorkerEvent.StatusChange,
    data: WebSocket.OPEN,
  })),

  // 对每次 open 启用新的心跳控制
  switchMap(() => {
    // 发送 Ping 并等待 Pong 的 Observable
    const pingAndWaitForPong = defer(() => {
      // 记录发送时间
      const pingTime = Date.now()

      ws.send({ action: SocketAction.Ping })

      return message$.pipe(
        filter(({ event }) => event === 'Pong'),
        take(1), // 只取第一个 Pong 消息
        tap(() => {
          const delay = Date.now() - pingTime
          broadcast({
            event: SocketWorkerEvent.DelayChange,
            data: delay,
          })
        }),
      )
    })

    // 超时检查的 Observable
    const pongOrTimeout = race(
      pingAndWaitForPong, // 等待 Pong
      timer(OPTIONS.HEARTBEAT.TIMEOUT).pipe(map(() => 'timeout')), // 超时信号
    )

    // 处理 Pong 或超时事件
    return pongOrTimeout.pipe(
      switchMap((result) => {
        // 超时未收到 Pong 回应，则断开连接
        if (typeof result === 'string') {
          ws.close()
          return EMPTY // 结束流
        }
        else {
          return of(true)
        }
      }),

      repeat({ delay: OPTIONS.HEARTBEAT.INTERVAL }), // 重复发送 Ping 直到收到关闭事件或超时

      takeUntil(close$), // 直到 socket 关闭停止发送
    )
  }),
).subscribe()

close$.pipe(
  tap(() => broadcast({
    event: SocketWorkerEvent.StatusChange,
    data: WebSocket.CLOSED,
  })),

  filter(ev => !ev.reason),

  switchMap(() => {
    return timer(OPTIONS.RECONNECT.DELAY).pipe(
      tap(() => {
        ws.reconnect()
      }),
      takeUntil(open$),
    )
  }),
).subscribe()

message$.pipe(
  filter(({ event }) => event !== 'Pong'),
  tap(data => broadcast({
    event: SocketWorkerEvent.Message,
    data,
  })),
).subscribe()

// ==================== events ====================

workerEvent.on(SocketWorkerEvent.Open, async (url) => {
  await ws.open(url)
})

workerEvent.on(SocketWorkerEvent.Close, async ({ reason }) => {
  await ws.close(reason as SocketCloseReason)
})

workerEvent.on(SocketWorkerEvent.Unload, (_, id) => {
  const port = ports.get(id)
  if (!port)
    return
  port.close()
  ports.delete(id)
  if (ports.size < 1)
    ws.close(SocketCloseReason.ALL_PORTS_CLOSED)
})

// ==================== message ====================

if (Object.prototype.toString.call(globalThis) === '[object SharedWorkerGlobalScope]') {
  void (globalThis as SharedWorkerGlobalScope).addEventListener('connect', (connectEvent: MessageEvent<WS.Message>) => {
    const port = connectEvent.ports[0]

    const portId = crypto.randomUUID()

    ports.set(portId, port)

    const sendToTab = <T extends SocketWorkerEvent>(message: Omit<WS.Message<T>, 'id'>, transfer: Transferable[] = []) => {
      const messageId = crypto.randomUUID()
      port.postMessage({ ...message, id: messageId }, transfer)
    }

    const portMessage$ = fromEvent<MessageEvent<WS.Message>>(port, 'message')

    portMessage$.pipe(
      filter(({ data }) => data.event !== SocketWorkerEvent.Confirm),
      tap(({ data }) => {
        sendToTab({ event: SocketWorkerEvent.Confirm, data: data.id }) // 消息确认
        // eslint-disable-next-line ts/no-explicit-any
        workerEvent.emit(data.event, data.data as any, portId)
      }),
    ).subscribe()
    port.start()

    // 初始化标签页的 ws 状态
    if (ws.instance)
      sendToTab({ event: SocketWorkerEvent.StatusChange, data: ws.instance.readyState })
  })
}
// HACK 兼容移动端 Chrome
else {
  ((ctx: DedicatedWorkerGlobalScope) => {
    const portId = crypto.randomUUID()
    ports.set(portId, ctx)

    const sendToTab = <T extends SocketWorkerEvent>(message: Omit<WS.Message<T>, 'id'>, transfer: Transferable[] = []) => {
      const messageId = crypto.randomUUID()
      ctx.postMessage({ ...message, id: messageId }, transfer)
    }

    const portMessage$ = fromEvent<MessageEvent<WS.Message>>(ctx, 'message')

    portMessage$.pipe(
      filter(({ data }) => data.event !== SocketWorkerEvent.Confirm),
      tap(({ data }) => {
        sendToTab({ event: SocketWorkerEvent.Confirm, data: data.id }) // 消息确认
        // eslint-disable-next-line ts/no-explicit-any
        workerEvent.emit(data.event, data.data as any, portId)
      }),
    ).subscribe()

    // 初始化标签页的 ws 状态
    if (ws.instance)
      sendToTab({ event: SocketWorkerEvent.StatusChange, data: ws.instance.readyState })
  })(globalThis as DedicatedWorkerGlobalScope)
}
