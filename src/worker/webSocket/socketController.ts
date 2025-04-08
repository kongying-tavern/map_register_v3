import type { WS } from './types'
import { WEBSOCKET_WORKER_CONFIG } from '@/configs'
import { SocketCloseReason, SocketStatus, SocketWorkerEvent } from '@/shared/socket'
import { defer, EMPTY, filter, map, of, race, repeat, Subject, switchMap, take, takeUntil, tap, timer } from 'rxjs'
import { socketLogger } from './socketLogger'

interface SocketControllerOptions {
  /** 向客户端进行广播的调用 */
  broadcast: <T extends SocketWorkerEvent>(message: Omit<WS.Message<T>, 'id'>, transfer: Transferable[]) => void
  /** 心跳包配置 */
  heartbeat?: {
    /**
     * 心跳包发送间隔
     * @default 30000
     */
    interval?: number
    /**
     * 超时判定时间
     * @default 30000
     */
    timeout?: number
  }
  /** 断线重连配置 */
  reconnect?: {
    /**
     * 重连等待时间
     * @default 3000
     */
    delay?: number
  }
}

type SocketConnectState = 'open' | 'close'

export enum ServerAction {
  /** 心跳 */
  Ping = 'Ping',
}

/** WebSocket 核心类 */
export class SocketController {
  #instance?: WebSocket
  get instance() {
    return this.#instance
  }

  #options: SocketControllerOptions
  #state: SocketConnectState = 'close'

  readonly close$ = new Subject<CloseEvent>()
  readonly error$ = new Subject<Event>()
  readonly open$ = new Subject<Event>()
  readonly message$ = new Subject<MessageEvent<string>>()
  readonly data$ = this.message$.pipe(map(({ data }) => JSON.parse(data) as API.WSData))

  constructor(options: SocketControllerOptions) {
    this.#options = options

    const { broadcast, heartbeat = {}, reconnect = {} } = options
    const {
      interval: heartbeatInterval = WEBSOCKET_WORKER_CONFIG.HEARTBEAT.INTERVAL,
      timeout: heartbeatTimeout = WEBSOCKET_WORKER_CONFIG.HEARTBEAT.TIMEOUT,
    } = heartbeat
    const {
      delay: reconnectDelay = WEBSOCKET_WORKER_CONFIG.RECONNECT.DELAY,
    } = reconnect

    // 连接建立
    this.open$.pipe(
      switchMap(() => {
        socketLogger.info(`Open: ${this.#instance?.url}`)
        broadcast({
          event: SocketWorkerEvent.StatusChange,
          data: SocketStatus.OPEN,
        }, [])

        // 发送 Ping
        let index = 0
        const pingAndWaitForPong = defer(() => {
          const pingTime = Date.now() // 发送时间
          this.send({ action: ServerAction.Ping, index: index++ })
          return this.data$.pipe(
            filter(({ event }) => event === 'Pong'),
            take(1), // 只取第一个 Pong 消息
            tap(() => {
              const delay = Date.now() - pingTime
              broadcast({
                event: SocketWorkerEvent.DelayChange,
                data: delay,
              }, [])
            }),
          )
        })

        // 超时检查
        const pongOrTimeout = race(
          pingAndWaitForPong, // 等待 Pong
          timer(heartbeatTimeout).pipe(map(() => 'timeout')), // 超时信号
        )

        // 处理 Pong 或超时事件
        return pongOrTimeout.pipe(
          switchMap((result) => {
            // 超时未收到 Pong 回应，则断开连接
            if (typeof result === 'string') {
              this.close(SocketCloseReason.HEARTBEAT_TIMEOUT)
              return EMPTY // 结束流
            }
            else {
              return of(true)
            }
          }),

          repeat({ delay: heartbeatInterval }), // 重复发送 Ping 直到收到关闭事件或超时

          takeUntil(this.close$), // 直到 socket 关闭停止发送
        )
      }),
    ).subscribe()

    // 连接关闭与重连
    this.close$.pipe(
      tap((ev) => {
        socketLogger.info(`Close: ${ev.reason}`)
        this.#instance = undefined
        broadcast({
          event: SocketWorkerEvent.StatusChange,
          data: SocketStatus.CLOSED,
        }, [])
      }),

      // 当关闭原因为如下时，不进行重连
      filter((ev) => {
        const { reason } = ev
        return ![
          SocketCloseReason.CLOSED_BY_USER,
          SocketCloseReason.URL_CHANGED,
          SocketCloseReason.ALL_PORTS_CLOSED,
        ].includes(reason as SocketCloseReason)
      }),

      switchMap(() => {
        return timer(reconnectDelay).pipe(
          tap(() => {
            this.reconnect()
          }),
          takeUntil(this.open$),
        )
      }),
    ).subscribe()

    // 错误处理
    this.error$.subscribe((ev) => {
      if (ev instanceof ErrorEvent) {
        socketLogger.error(`Error: ${ev.error instanceof Error ? ev.error.message : ev.message}`)
      }
      else if (ev instanceof DOMException) {
        socketLogger.error(`Error: ${ev.message ?? ev.name}`)
      }
      else {
        const { stack = `Error: unknown` } = new Error('stack')
        socketLogger.error(stack)
      }
    })

    // 接收到消息
    this.data$.pipe(
      filter(({ event }) => event !== 'Pong'),
      tap((data) => {
        socketLogger.info(`Message: ${JSON.stringify(data)}`)
        broadcast({
          event: SocketWorkerEvent.Message,
          data,
        }, [])
      }),
    ).subscribe()
  }

  #getPath = (url: string) => {
    return url.replace(/^([a-z][a-z0-9+.-]*):\/\//i, '')
  }

  open = (url: string) => {
    if (this.instance) {
      if (this.#getPath(this.instance.url) !== this.#getPath(url))
        this.close(SocketCloseReason.URL_CHANGED)
      else if (this.instance.readyState === SocketStatus.OPEN)
        return
    }

    this.#state = 'open'
    const instance = new WebSocket(url)
    socketLogger.info('Connecting')
    this.#options.broadcast({
      event: SocketWorkerEvent.StatusChange,
      data: SocketStatus.CONNECTING,
    }, [])

    // 将事件监听器转换为 subject 以便通过 rxjs 操作符处理
    instance.addEventListener('open', ev => this.open$.next(ev))
    instance.addEventListener('message', ev => this.message$.next(ev))
    instance.addEventListener('close', ev => this.close$.next(ev))
    instance.addEventListener('error', ev => this.error$.next(ev))

    this.#instance = instance
  }

  reconnect = async () => {
    if (!this.instance || this.instance.readyState === SocketStatus.OPEN)
      return
    socketLogger.info(`Reconnect`)
    this.open(this.instance.url)
  }

  close = (reason: SocketCloseReason) => {
    if (!this.#instance || this.#state === 'close')
      return
    this.#state = 'close'
    socketLogger.info('Closing')
    this.#options.broadcast({
      event: SocketWorkerEvent.StatusChange,
      data: SocketStatus.CLOSING,
    }, [])
    this.#instance.close(1000, reason)
  }

  send = <T>(data: API.WSSentData<T>) => {
    if (!this.instance || this.instance.readyState !== SocketStatus.OPEN || this.#state === 'close')
      return
    if (data.action !== ServerAction.Ping)
      socketLogger.info(JSON.stringify(data))
    this.instance.send(JSON.stringify(data))
  }
}
