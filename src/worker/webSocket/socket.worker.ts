import type { Socket } from 'socket.io-client'
import { io } from 'socket.io-client'
import { wsdb } from '@/database'
import { isSharedWorker } from '@/utils/worker/utils'
import { WorkerIPC } from '@/utils/worker/worker-ipc'

declare const globalThis: WorkerGlobalScope

type ServerEvents = {
  [K in keyof API.WSEventMap]: {
    event: K
    data: API.WSEventMap[K][0]
  }
}[keyof API.WSEventMap]

const context = {
  status: 'INIT' as AppSocket.Status,
  socket: null as Socket | null,
  delay: 999,
  openPromise: null as Promise<Socket> | null,
  pages: new Set<string>(),
  ports: new Map<string, MessagePort>(),
  heartbeat: new Map<string, { timer: number | null, responded: boolean }>(),
  rtt: {
    interval: 30000,
    time: 0,
    id: crypto.randomUUID(),
  },
}

// DEBUG
Reflect.set(globalThis, 'context', context)

const ipc = new WorkerIPC<AppSocket.MainEventMap, AppSocket.WorkerEventMap>((message) => {
  if (isSharedWorker(globalThis)) {
    const { pages, ports } = context
    pages.forEach((pageId) => {
      const port = ports.get(pageId)
      if (!port)
        return
      port.postMessage(message)
    })
  }
  else {
    void (globalThis as DedicatedWorkerGlobalScope).postMessage(message)
  }
})

const startRttCheckLoop = (socket: Socket) => {
  let timer: number | null = null

  const requestRttCheck = () => {
    context.rtt.id = crypto.randomUUID()
    context.rtt.time = Date.now()
    socket.emit('rttcheck', { id: context.rtt.id })
  }

  socket.on('rttcheck', ({ id, receiveTimestamp, sendTimestamp }: AppSocket.SocketEventMap['rttcheck'][0]) => {
    if (id !== context.rtt.id)
      return
    const endTime = Date.now()
    const totalRtt = endTime - context.rtt.time
    const serverProcessTime = sendTimestamp - receiveTimestamp
    const rtt = totalRtt - serverProcessTime
    context.delay = rtt
    ipc.emit('delayChange', rtt)
    setTimeout(() => requestRttCheck(), context.rtt.interval)
  })

  socket.on('disconnect', () => {
    if (timer === null)
      return
    clearTimeout(timer)
    timer = null
  })

  requestRttCheck()
}

// ====================   event handler    ====================

/** 开启 socket 连接 */
ipc.handle('open', async (url, options) => {
  if (context.socket) {
    const { query = {} } = context.socket.io.opts
    if (options.query.userId === query.userId) {
      context.status = 'OPEN'
      ipc.emit('statusChange', 'OPEN')
      return 'reused'
    }
  }

  if (context.openPromise) {
    ipc.emit('statusChange', 'CONNECTING')
    await context.openPromise
    return 'reused'
  }

  const { resolve, reject, promise } = Promise.withResolvers<Socket>()

  context.status = 'CONNECTING'
  ipc.emit('statusChange', context.status)

  // 初始化 socket 连接
  const socket = io(url, {
    path: options.path,
    query: options.query,
    transports: ['websocket'],
  })

  startRttCheckLoop(socket)

  socket.on('message', async (message: string) => {
    try {
      const payload = JSON.parse(message) as ServerEvents
      // eslint-disable-next-line ts/no-explicit-any
      ipc.emit(payload.event, payload.data as any)
      await wsdb.logs.add({
        t: Date.now(),
        msg: message,
        type: 0,
      })
    }
    catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      ipc.emit('error', error.message, error.stack || '')
    }
  })

  socket.on('connect', () => {
    resolve(socket)
    context.socket = socket
    context.openPromise = null
    context.status = 'OPEN'
    ipc.emit('statusChange', context.status)
  })

  socket.on('connect_error', () => {
    reject(new Error('Low level connection can not be established'))
    context.status = 'CLOSED'
    ipc.emit('statusChange', context.status)
  })

  socket.on('disconnect', () => {
    context.status = 'CLOSED'
    ipc.emit('statusChange', context.status)
  })

  context.openPromise = promise
  await promise
  return 'created'
})

/** 关闭 socket 连接 */
ipc.handle('close', async () => {
  if (context.openPromise)
    await context.openPromise
  if (!context.socket)
    return
  context.socket.close()
  context.socket = null
})

/** 响应心跳 ping */
ipc.handle('pong', async (id) => {
  const heartbeat = context.heartbeat.get(id)
  if (heartbeat) {
    heartbeat.responded = true
    if (heartbeat.timer !== null) {
      clearTimeout(heartbeat.timer)
      heartbeat.timer = null
    }
  }
})

/** 清理客户端 */
const cleanupClient = (id: string) => {
  context.pages.delete(id)
  context.ports.delete(id)
  const heartbeat = context.heartbeat.get(id)
  if (heartbeat && heartbeat.timer !== null) {
    clearTimeout(heartbeat.timer)
  }
  context.heartbeat.delete(id)

  // 如果是 shared worker 且没有客户端了，关闭 worker
  if (isSharedWorker(globalThis) && context.pages.size === 0) {
    // 关闭 socket 连接
    if (context.socket) {
      context.socket.close()
      context.socket = null
    }
    // 结束 shared worker
    globalThis.close()
  }
}

// ====================    event listener    ====================

/** 启动心跳机制 */
const startHeartbeat = () => {
  const heartbeatInterval = 30000 // 30 秒发送一次 ping
  const heartbeatTimeout = 10000 // 10 秒内没有响应则认为断连

  const sendPing = () => {
    if (context.pages.size === 0) {
      return
    }

    context.pages.forEach((id) => {
      const clientPort = context.ports.get(id)
      if (!clientPort) {
        cleanupClient(id)
        return
      }

      // 检查上次心跳是否响应
      const heartbeat = context.heartbeat.get(id)
      if (heartbeat && !heartbeat.responded) {
        // 上次心跳未响应，清理客户端
        cleanupClient(id)
        return
      }

      // 发送 ping 到特定客户端
      clientPort.postMessage({
        id: crypto.randomUUID(),
        type: 'request',
        channel: 'ping',
        args: [],
      })
      // 更新心跳状态
      const newHeartbeat = {
        responded: false,
        timer: setTimeout(() => {
          // 超时未响应，清理客户端
          cleanupClient(id)
        }, heartbeatTimeout) as unknown as number,
      }
      context.heartbeat.set(id, newHeartbeat)
    })

    // 继续下一次心跳
    setTimeout(sendPing, heartbeatInterval)
  }

  // 延迟启动，给客户端初始化时间
  setTimeout(sendPing, heartbeatInterval)
}

// sharedworker 下需要管理所有页面
if (Object.prototype.toString.call(globalThis) === '[object SharedWorkerGlobalScope]') {
  const scope = globalThis as SharedWorkerGlobalScope

  // 在 WorkerIPC 初始化后，为每个连接添加额外的消息监听器来处理 pong
  // 注意：WorkerIPC 已经在 connect 事件中为每个 port 添加了 messageListener
  // 我们需要在它之后添加额外的监听器，或者通过 handle 来处理
  // 但由于 handle 无法知道消息来源，我们需要在 connect 事件中单独处理

  scope.addEventListener('connect', (ev) => {
    const id = crypto.randomUUID()
    context.pages.add(id)
    const port = ev.ports[0]
    context.ports.set(id, port)

    // 为每个客户端创建额外的消息监听器来处理 pong
    const pongMessageListener = (ev: MessageEvent<unknown>) => {
      const { data } = ev
      // 处理 pong 响应
      if (data && typeof data === 'object' && 'type' in data && data.type === 'request' && 'channel' in data && data.channel === 'pong') {
        const args = 'args' in data && Array.isArray(data.args) ? data.args : []
        const clientId = args[0] as string | undefined
        if (clientId === id) {
          const heartbeat = context.heartbeat.get(id)
          if (heartbeat) {
            heartbeat.responded = true
            if (heartbeat.timer !== null) {
              clearTimeout(heartbeat.timer)
              heartbeat.timer = null
            }
          }
        }
      }
    }

    port.addEventListener('message', pongMessageListener)
    port.start()

    ipc.emit('init', id)
    ipc.emit('statusChange', context.status)
    ipc.emit('delayChange', context.delay)
  })

  // 启动心跳机制
  startHeartbeat()
}
// worker 下只需要管理单独页面
else {
  const id = crypto.randomUUID()
  context.pages.add(id)
  ipc.emit('init', id)
  ipc.emit('statusChange', context.status)
  ipc.emit('delayChange', context.delay)
}
