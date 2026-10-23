import { WEBSOCKET_WORKER_CONFIG } from '@/configs/websocket'

/** 服务端下发的 `W<T>` 信封 */
export interface ServerMessage {
  event: WebSocketAPI.WSEventType
  message?: string
  data: unknown
  time?: string
}

export interface WebSocketClientHandlers {
  /** 连接状态变化 */
  onStatusChange?: (status: AppSocket.Status) => void
  /** 收到非 Pong 的业务事件 */
  onMessage?: (message: ServerMessage) => void
  /** 收到心跳 Pong（已由客户端消费） */
  onPong?: () => void
  /** 心跳往返时延（ms） */
  onDelayChange?: (delay: number) => void
  /** 错误信息 */
  onError?: (message: string, stack?: string) => void
}

export interface WebSocketClientConfig {
  heartbeat: {
    /** 心跳发送间隔（ms） */
    interval: number
    /** 发出 Ping 后等待 Pong 的超时（ms） */
    timeout: number
  }
  reconnect: {
    /** 首次重连等待（ms） */
    initialDelay: number
    /** 重连等待上限（ms） */
    maxDelay: number
  }
}

const DEFAULT_CONFIG: WebSocketClientConfig = {
  heartbeat: {
    interval: WEBSOCKET_WORKER_CONFIG.HEARTBEAT.INTERVAL,
    timeout: WEBSOCKET_WORKER_CONFIG.HEARTBEAT.TIMEOUT,
  },
  reconnect: {
    initialDelay: WEBSOCKET_WORKER_CONFIG.RECONNECT.INITIAL_DELAY,
    maxDelay: WEBSOCKET_WORKER_CONFIG.RECONNECT.MAX_DELAY,
  },
}

/** 心跳 Ping 帧（Rust 契约：`{"action":"Ping"}`） */
export const PING_FRAME = JSON.stringify({ action: 'Ping' })

const SOCKET_OPEN = 1

/**
 * 裸 WebSocket 客户端（RFC 6455）
 *
 * - 地址由 {@link buildSocketUrl} 拼接，token 走 `?token=`；
 * - 心跳：每 `heartbeat.interval` 发 `{"action":"Ping"}`，收到 `Pong` 事件后计算时延；
 * - 断线重连：指数退避 `initialDelay * 2^n`，封顶 `maxDelay`；
 * - 收到 Pong 以外的 `W<T>` 信封交给 {@link WebSocketClientHandlers.onMessage}。
 */
export class RawWebSocketClient {
  #url: string
  #handlers: WebSocketClientHandlers
  #config: WebSocketClientConfig

  #socket: WebSocket | null = null
  #closedByUser = false
  #reconnectAttempt = 0
  #reconnectTimer: ReturnType<typeof setTimeout> | null = null
  #heartbeatTimer: ReturnType<typeof setInterval> | null = null
  #pongTimer: ReturnType<typeof setTimeout> | null = null
  #lastPingAt = 0

  constructor(url: string, handlers: WebSocketClientHandlers = {}, config: WebSocketClientConfig = DEFAULT_CONFIG) {
    this.#url = url
    this.#handlers = handlers
    this.#config = config
  }

  get url() {
    return this.#url
  }

  get isOpen() {
    return this.#socket?.readyState === SOCKET_OPEN
  }

  /** 建立连接（重复调用无副作用） */
  connect = (): void => {
    if (this.#closedByUser || this.#socket)
      return
    this.#clearReconnectTimer()
    this.#notifyStatus('CONNECTING')

    const socket = new WebSocket(this.#url)
    this.#socket = socket

    socket.onopen = () => {
      this.#reconnectAttempt = 0
      this.#notifyStatus('OPEN')
      this.#startHeartbeat()
    }

    socket.onmessage = (ev: MessageEvent) => {
      this.#handleMessage(ev.data)
    }

    // error 事件只提供通用信息，具体原因交给随后的 close 事件
    socket.onerror = () => {
      this.#handlers.onError?.('WebSocket 连接发生错误', undefined)
    }

    socket.onclose = (ev: CloseEvent) => {
      this.#stopHeartbeat()
      if (this.#socket === socket)
        this.#socket = null
      this.#notifyStatus('CLOSED')
      if (this.#closedByUser)
        return
      this.#handlers.onError?.(`WebSocket 连接已关闭（code=${ev.code}）`, undefined)
      this.#scheduleReconnect()
    }
  }

  /** 主动关闭连接，不再重连 */
  close = (): void => {
    this.#closedByUser = true
    this.#clearReconnectTimer()
    this.#stopHeartbeat()
    const socket = this.#socket
    this.#socket = null
    if (!socket) {
      this.#notifyStatus('CLOSED')
      return
    }
    this.#notifyStatus('CLOSING')
    socket.close()
  }

  #notifyStatus = (status: AppSocket.Status) => {
    this.#handlers.onStatusChange?.(status)
  }

  #clearReconnectTimer = () => {
    if (this.#reconnectTimer === null)
      return
    clearTimeout(this.#reconnectTimer)
    this.#reconnectTimer = null
  }

  #scheduleReconnect = () => {
    if (this.#closedByUser || this.#reconnectTimer !== null)
      return
    const { initialDelay, maxDelay } = this.#config.reconnect
    const delay = Math.min(maxDelay, initialDelay * 2 ** this.#reconnectAttempt)
    this.#reconnectAttempt += 1
    this.#notifyStatus('CONNECTING')
    this.#reconnectTimer = setTimeout(() => {
      this.#reconnectTimer = null
      if (this.#closedByUser)
        return
      this.connect()
    }, delay)
  }

  #startHeartbeat = () => {
    this.#stopHeartbeat()
    // 连接建立后立即 Ping 一次，尽快拿到首个时延读数
    this.#sendPing()
    this.#heartbeatTimer = setInterval(() => this.#sendPing(), this.#config.heartbeat.interval)
  }

  #stopHeartbeat = () => {
    if (this.#heartbeatTimer !== null) {
      clearInterval(this.#heartbeatTimer)
      this.#heartbeatTimer = null
    }
    if (this.#pongTimer !== null) {
      clearTimeout(this.#pongTimer)
      this.#pongTimer = null
    }
  }

  #sendPing = () => {
    const socket = this.#socket
    if (!socket || socket.readyState !== SOCKET_OPEN)
      return
    this.#lastPingAt = Date.now()
    if (this.#pongTimer !== null)
      clearTimeout(this.#pongTimer)
    this.#pongTimer = setTimeout(() => {
      this.#pongTimer = null
      this.#handlers.onError?.('WebSocket 心跳超时，连接将被重建', undefined)
      // close 事件里统一走重连逻辑
      this.#socket?.close()
    }, this.#config.heartbeat.timeout)
    socket.send(PING_FRAME)
  }

  #handlePong = () => {
    if (this.#pongTimer === null)
      return
    clearTimeout(this.#pongTimer)
    this.#pongTimer = null
    this.#handlers.onDelayChange?.(Math.max(0, Date.now() - this.#lastPingAt))
    this.#handlers.onPong?.()
  }

  #handleMessage = (raw: unknown) => {
    if (typeof raw !== 'string') {
      this.#handlers.onError?.('收到不支持的 WebSocket 消息类型（仅支持文本帧）', undefined)
      return
    }
    let payload: ServerMessage
    try {
      payload = JSON.parse(raw) as ServerMessage
    }
    catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      this.#handlers.onError?.(`无法解析 WebSocket 消息：${error.message}`, error.stack)
      return
    }
    if (!payload || typeof payload !== 'object' || typeof payload.event !== 'string') {
      this.#handlers.onError?.('WebSocket 消息缺少 event 字段', undefined)
      return
    }
    if (payload.event === 'Pong') {
      this.#handlePong()
      return
    }
    this.#handlers.onMessage?.(payload)
  }
}
