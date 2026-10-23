/* eslint-disable no-console */
import type { ServerMessage } from './websocket-client'
import { WEBSOCKET_WORKER_CONFIG } from '@/configs/websocket'
import { wsdb } from '@/database'
import { WorkerIPC } from '@/utils/worker/worker-ipc'
import { RawWebSocketClient } from './websocket-client'
import { buildSocketUrl } from './ws-url'

declare const globalThis: WorkerGlobalScope

type PageIPC = WorkerIPC<AppSocket.MainEventMap, AppSocket.WorkerEventMap>

const context = {
  status: 'INIT' as AppSocket.Status,
  delay: 999,
  client: null as RawWebSocketClient | null,
  url: '',
  ports: new Map<string, PageIPC>(),
}

// DEBUG
Reflect.set(globalThis, 'context', context)

const broadcast = <C extends keyof AppSocket.WorkerEventMap>(
  channel: C,
  ...args: AppSocket.WorkerEventMap[C]['args']
) => {
  context.ports.forEach(ipc => ipc.emit(channel, ...args))
}

const broadcastStatus = (status: AppSocket.Status) => {
  context.status = status
  broadcast('statusChange', status)
}

const broadcastDelay = (delay: number) => {
  context.delay = delay
  broadcast('delayChange', delay)
}

/** 落库 WS 日志，失败不影响推送分发 */
const saveLog = async (msg: string, type: 0 | 1 = 0) => {
  try {
    await wsdb.logs.add({ t: Date.now(), msg, type })
  }
  catch (err) {
    console.error('save websocket log failed', err)
  }
}

/** 把 `W<T>` 信封按事件名分发给所有接入页面 */
const dispatchMessage = (message: ServerMessage) => {
  const { event, data } = message
  context.ports.forEach((ipc) => {
    // 事件名来自服务端，按 WorkerEventMap 的映射约束分发
    ipc.emit(event, data as never)
  })
}

/** 建立或复用裸 WebSocket 连接（token 由页面经 IPC 传入，worker 不读 localStorage） */
const openSocket = (options: { userId: string, token: string }): 'created' | 'reused' => {
  const { userId, token } = options
  if (!userId || !token)
    throw new Error('建立 WebSocket 连接需要 userId 与 accessToken')

  const url = buildSocketUrl({
    wsBase: import.meta.env.VITE_WS_BASE,
    apiBase: import.meta.env.VITE_API_BASE,
    origin: globalThis.location.origin,
    userId,
    token,
  })

  if (context.client && context.url === url) {
    console.log('Reusable WebSocket found')
    if (context.client.isOpen)
      broadcastStatus('OPEN')
    return 'reused'
  }

  // URL 变化（例如 token 刷新）必须重建连接
  context.client?.close()

  const client: RawWebSocketClient = new RawWebSocketClient(url, {
    onStatusChange: (status) => {
      if (context.client === client)
        broadcastStatus(status)
    },
    onMessage: (message) => {
      dispatchMessage(message)
      saveLog(JSON.stringify(message))
    },
    onPong: () => {
      broadcast('Pong')
    },
    onDelayChange: (delay) => {
      if (context.client === client)
        broadcastDelay(delay)
    },
    onError: (message, stack) => {
      broadcast('error', message, stack ?? '')
    },
  })

  context.client = client
  context.url = url
  client.connect()
  console.log('WebSocket client created:', url.replace(/token=[^&]+/, 'token=***'))
  return 'created'
}

const closeSocket = () => {
  context.client?.close()
  context.client = null
  context.url = ''
}

// ====================   事件监听    ====================

/** 页面心跳：页面失联（关闭 / 崩溃）后回收其 IPC 通道 */
const startHeartbeat = (id: string, ipc: PageIPC) => {
  let disconnectTimer: number | null = null

  const startNextPing = () => {
    globalThis.setTimeout(() => {
      ipc.emit('ping', id)
      disconnectTimer = globalThis.setTimeout(() => {
        context.ports.delete(id)
      }, WEBSOCKET_WORKER_CONFIG.HEARTBEAT.TIMEOUT)
    }, WEBSOCKET_WORKER_CONFIG.HEARTBEAT.INTERVAL)
  }

  startNextPing()

  ipc.handle('pong', () => {
    if (!disconnectTimer)
      return
    globalThis.clearTimeout(disconnectTimer)
    disconnectTimer = null
    startNextPing()
  })
}

/** 接入一个页面（SharedWorker 的每个 port 或独立 Worker 的唯一 port） */
const registerPage = (ipc: PageIPC, id: string) => {
  context.ports.set(id, ipc)

  ipc.handle('open', async (options) => {
    return openSocket(options)
  })

  ipc.handle('close', async () => {
    closeSocket()
  })

  ipc.emit('init', id)
  ipc.emit('statusChange', context.status)
  ipc.emit('delayChange', context.delay)
  startHeartbeat(id, ipc)
}

// sharedworker 下需要管理所有页面
if (Object.prototype.toString.call(globalThis) === '[object SharedWorkerGlobalScope]') {
  const scope = globalThis as SharedWorkerGlobalScope

  scope.addEventListener('connect', (ev) => {
    const id = crypto.randomUUID()
    const port = ev.ports[0]

    const ipc = new WorkerIPC<AppSocket.MainEventMap, AppSocket.WorkerEventMap>(port)
    port.start()
    registerPage(ipc, id)
  })
}
// worker 下只需要管理单独页面（移动端没有 SharedWorker）
else {
  const scope = globalThis as DedicatedWorkerGlobalScope
  const id = crypto.randomUUID()
  const ipc = new WorkerIPC<AppSocket.MainEventMap, AppSocket.WorkerEventMap>(scope)
  registerPage(ipc, id)
}
