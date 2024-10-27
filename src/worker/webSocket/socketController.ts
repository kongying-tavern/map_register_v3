import { EMPTY, Subject, defer, filter, map, of, race, repeat, switchMap, take, takeUntil, tap, timer } from 'rxjs'
import type { WS } from './types'
import { SocketCloseReason, SocketWorkerEvent } from '@/shared/socket'
import { WEBSOCKET_WORKER_CONFIG } from '@/configs'

interface SocketControllerOptions {
  /** 向客户端进行广播的调用 */
  broadcast<T extends SocketWorkerEvent>(message: Omit<WS.Message<T>, 'id'>, transfer: Transferable[]): void
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

  #closeReason?: string
  #closeResolvers?: PromiseWithResolvers<CloseEvent>
  #openResolvers?: PromiseWithResolvers<Event>
  #options: SocketControllerOptions

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
      tap((ev) => {
        this.#openResolvers?.resolve(ev)
        this.#openResolvers = undefined
        broadcast({
          event: SocketWorkerEvent.StatusChange,
          data: WebSocket.OPEN,
        }, [])
      }),

      // 心跳控制
      switchMap(() => {
        // 发送 Ping 并等待 Pong 的 Observable
        const pingAndWaitForPong = defer(() => {
          // 记录发送时间
          const pingTime = Date.now()

          this.send({ action: ServerAction.Ping })

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

        // 超时检查的 Observable
        const pongOrTimeout = race(
          pingAndWaitForPong, // 等待 Pong
          timer(heartbeatTimeout).pipe(map(() => 'timeout')), // 超时信号
        )

        // 处理 Pong 或超时事件
        return pongOrTimeout.pipe(
          switchMap((result) => {
            // 超时未收到 Pong 回应，则断开连接
            if (typeof result === 'string') {
              this.close()
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

    // 重连
    this.close$.pipe(
      tap((ev) => {
        this.#closeResolvers?.resolve(ev)
        this.#closeResolvers = undefined
        this.#openResolvers = undefined
        broadcast({
          event: SocketWorkerEvent.StatusChange,
          data: WebSocket.CLOSED,
        }, [])
      }),

      // 如果上一次关闭存在用户原因，则并非为错误导致的关闭，不进行自动重连
      filter(() => !this.#closeReason),

      switchMap(() => {
        this.#closeReason = undefined
        return timer(reconnectDelay).pipe(
          tap(() => {
            this.reconnect()
          }),
          takeUntil(this.open$),
        )
      }),
    ).subscribe()

    // 错误处理
    this.error$.subscribe(() => {
      this.#closeResolvers = undefined
      this.#openResolvers = undefined
    })

    // 接收到消息
    this.data$.pipe(
      filter(({ event }) => event !== 'Pong'),
      tap(data => broadcast({
        event: SocketWorkerEvent.Message,
        data,
      }, [])),
    ).subscribe()
  }

  open = async (url: string) => {
    if (this.instance) {
      if (this.instance.url !== url)
        await this.close(SocketCloseReason.URL_CHANGED)
      else if (this.instance.readyState === WebSocket.OPEN)
        return
      else if (this.#openResolvers)
        return await this.#openResolvers.promise
    }

    const openResolvers = Promise.withResolvers<Event>()
    this.#openResolvers = openResolvers

    const newSocket = new WebSocket(url)
    this.#instance = newSocket

    this.#options.broadcast({
      event: SocketWorkerEvent.StatusChange,
      data: WebSocket.CONNECTING,
    }, [])

    // 将事件监听器转换为 subject 以便通过 rxjs 操作符处理
    newSocket.addEventListener('open', ev => this.open$.next(ev))
    newSocket.addEventListener('message', ev => this.message$.next(ev))
    newSocket.addEventListener('close', ev => this.close$.next(ev))
    newSocket.addEventListener('error', ev => this.error$.next(ev))
  }

  reconnect = async () => {
    if (!this.instance || this.instance.readyState === WebSocket.OPEN)
      return

    if (this.#openResolvers)
      return await this.#openResolvers.promise

    await this.open(this.instance.url)
  }

  close = async (reason?: SocketCloseReason) => {
    if (!this.instance)
      return

    if (this.#closeResolvers)
      return await this.#closeResolvers.promise

    const closeResolvers = Promise.withResolvers<CloseEvent>()

    this.#closeResolvers = closeResolvers

    this.#options.broadcast({
      event: SocketWorkerEvent.StatusChange,
      data: WebSocket.CLOSING,
    }, [])

    this.instance.close()
    this.#closeReason = reason

    return await closeResolvers.promise
  }

  send = <T>(data: API.WSSentData<T>) => {
    if (!this.instance || this.instance.readyState !== WebSocket.OPEN)
      return
    this.instance.send(JSON.stringify(data))
  }
}
