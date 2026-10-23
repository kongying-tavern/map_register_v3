import type { ServerMessage, WebSocketClientConfig } from '@/worker/webSocket/websocket-client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PING_FRAME, RawWebSocketClient } from '@/worker/webSocket/websocket-client'

/**
 * 单元测试：裸 WebSocket 客户端
 *
 * 覆盖评审 P0-2「WS 鉴权脱节」迁移的关键行为：
 * - 使用 buildSocketUrl 产物建立连接（含 `/ws/{userId}?token=`）；
 * - 每 30s 发送 `{"action":"Ping"}`，收到 `Pong` 事件后计算往返时延；
 * - `W<T>` 业务信封正确交给 onMessage；
 * - 断线按 1s/2s/4s/.../30s 指数退避重连，主动关闭后不再重连。
 */

const URL = 'wss://example.test/ws/42?token=AT-1'

class MockWebSocket {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3
  static instances: MockWebSocket[] = []

  readyState = MockWebSocket.CONNECTING
  url: string
  sent: string[] = []
  onopen: (() => void) | null = null
  onmessage: ((ev: MessageEvent) => void) | null = null
  onclose: ((ev: CloseEvent) => void) | null = null
  onerror: (() => void) | null = null

  constructor(url: string) {
    this.url = url
    MockWebSocket.instances.push(this)
  }

  send = (data: string) => {
    this.sent.push(data)
  }

  close = () => {
    if (this.readyState === MockWebSocket.CLOSED)
      return
    this.readyState = MockWebSocket.CLOSED
    this.onclose?.({ code: 1000, reason: 'closed' } as CloseEvent)
  }

  /** 模拟握手成功 */
  open = () => {
    this.readyState = MockWebSocket.OPEN
    this.onopen?.()
  }

  /** 模拟连接异常断开 */
  fail = (code = 1006) => {
    this.readyState = MockWebSocket.CLOSED
    this.onclose?.({ code, reason: 'failed' } as CloseEvent)
  }

  /** 模拟收到服务端文本帧 */
  receive = (data: string) => {
    this.onmessage?.({ data } as MessageEvent)
  }
}

const lastSocket = () => MockWebSocket.instances.at(-1)!

/** 缩短单测时长用的配置（默认值同为 30s/1s/30s） */
const testConfig: WebSocketClientConfig = {
  heartbeat: { interval: 30_000, timeout: 30_000 },
  reconnect: { initialDelay: 1_000, maxDelay: 30_000 },
}

interface Recorded {
  statuses: AppSocket.Status[]
  messages: ServerMessage[]
  pongs: number
  delays: number[]
  errors: string[]
}

const createClient = () => {
  const recorded: Recorded = { statuses: [], messages: [], pongs: 0, delays: [], errors: [] }
  const client = new RawWebSocketClient(URL, {
    onStatusChange: status => recorded.statuses.push(status),
    onMessage: message => recorded.messages.push(message),
    onPong: () => recorded.pongs++,
    onDelayChange: delay => recorded.delays.push(delay),
    onError: message => recorded.errors.push(message),
  }, testConfig)
  return { client, recorded }
}

describe('rawWebSocketClient', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    MockWebSocket.instances = []
    vi.stubGlobal('WebSocket', MockWebSocket)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('使用传入地址建立连接并同步状态', () => {
    const { client, recorded } = createClient()
    client.connect()

    expect(MockWebSocket.instances).toHaveLength(1)
    expect(lastSocket().url).toBe(URL)
    expect(recorded.statuses).toEqual(['CONNECTING'])

    lastSocket().open()
    expect(recorded.statuses).toEqual(['CONNECTING', 'OPEN'])
    expect(client.isOpen).toBe(true)
  })

  it('连接建立后立即 Ping，此后每 30s Ping 一次', () => {
    const { client } = createClient()
    client.connect()
    lastSocket().open()

    expect(lastSocket().sent).toEqual([PING_FRAME])

    // 每轮 Ping 后回 Pong，维持连接
    vi.advanceTimersByTime(50)
    lastSocket().receive(JSON.stringify({ event: 'Pong', data: null }))
    vi.advanceTimersByTime(29_950)
    expect(lastSocket().sent).toHaveLength(2)
    expect(JSON.parse(lastSocket().sent[1])).toEqual({ action: 'Ping' })

    vi.advanceTimersByTime(50)
    lastSocket().receive(JSON.stringify({ event: 'Pong', data: null }))
    vi.advanceTimersByTime(29_950)
    expect(lastSocket().sent).toHaveLength(3)
  })

  it('收到 Pong 事件后计算往返时延并重置心跳', () => {
    const { client, recorded } = createClient()
    client.connect()
    lastSocket().open()

    // 首个 Ping 后 120ms 收到 Pong
    vi.advanceTimersByTime(120)
    lastSocket().receive(JSON.stringify({ event: 'Pong', data: null, message: '', time: '2026-10-23 00:00:00' }))

    expect(recorded.delays).toEqual([120])
    expect(recorded.pongs).toBe(1)
    // Pong 不应作为业务事件再分发
    expect(recorded.messages).toHaveLength(0)
    expect(recorded.errors).toHaveLength(0)
  })

  it('心跳超时判定断线并按 1s 退避重连', () => {
    const { client, recorded } = createClient()
    client.connect()
    lastSocket().open()

    // 30s 内未收到 Pong，心跳超时关闭连接
    vi.advanceTimersByTime(30_000)
    expect(recorded.errors.some(message => message.includes('心跳超时'))).toBe(true)
    expect(recorded.statuses).toContain('CLOSED')
    // 关闭后立即进入重连等待态
    expect(recorded.statuses.at(-1)).toBe('CONNECTING')

    // 1s 后重连（新连接，同一 URL）
    vi.advanceTimersByTime(1_000)
    expect(MockWebSocket.instances).toHaveLength(2)
    expect(lastSocket().url).toBe(URL)
    expect(recorded.statuses.at(-1)).toBe('CONNECTING')
  })

  it('断线重连按 1s→2s→4s→8s→16s→30s 指数退避并封顶', () => {
    const { client } = createClient()
    client.connect()

    const delays = [1_000, 2_000, 4_000, 8_000, 16_000, 30_000]
    for (const delay of delays) {
      const before = MockWebSocket.instances.length
      lastSocket().fail()
      vi.advanceTimersByTime(delay - 1)
      expect(MockWebSocket.instances).toHaveLength(before)
      vi.advanceTimersByTime(1)
      expect(MockWebSocket.instances).toHaveLength(before + 1)
    }
  })

  it('握手成功后重置退避计数', () => {
    const { client } = createClient()
    client.connect()

    // 先失败两次，让退避到 4s
    lastSocket().fail()
    vi.advanceTimersByTime(1_000)
    lastSocket().fail()
    vi.advanceTimersByTime(2_000)

    // 第三次连接成功，再次断开应按 1s 起步
    lastSocket().open()
    const before = MockWebSocket.instances.length
    lastSocket().fail()
    vi.advanceTimersByTime(1_000)
    expect(MockWebSocket.instances).toHaveLength(before + 1)
  })

  it('业务事件交给 onMessage，非法帧仅上报错误', () => {
    const { client, recorded } = createClient()
    client.connect()
    lastSocket().open()

    lastSocket().receive(JSON.stringify({
      event: 'MarkerAdded',
      message: '',
      data: 7,
      time: '2026-10-23 00:00:00',
    }))
    expect(recorded.messages).toHaveLength(1)
    expect(recorded.messages[0]).toMatchObject({ event: 'MarkerAdded', data: 7 })

    lastSocket().receive('not-json')
    expect(recorded.errors.some(message => message.includes('无法解析'))).toBe(true)
    expect(recorded.messages).toHaveLength(1)

    lastSocket().receive(JSON.stringify({ data: 1 }))
    expect(recorded.errors.some(message => message.includes('缺少 event'))).toBe(true)
  })

  it('主动关闭后不再重连', () => {
    const { client, recorded } = createClient()
    client.connect()
    lastSocket().open()

    const statusCountBeforeClose = recorded.statuses.length
    client.close()
    expect(recorded.statuses.slice(statusCountBeforeClose)).toEqual(['CLOSING', 'CLOSED'])

    vi.advanceTimersByTime(60_000)
    expect(MockWebSocket.instances).toHaveLength(1)
    expect(recorded.statuses.slice(statusCountBeforeClose)).not.toContain('CONNECTING')
  })
})
