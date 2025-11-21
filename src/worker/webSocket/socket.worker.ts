import type { Socket } from 'socket.io-client'
import { io } from 'socket.io-client'
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

  socket.on('message', (message: string) => {
    try {
      const payload = JSON.parse(message) as ServerEvents
      // eslint-disable-next-line ts/no-explicit-any
      ipc.emit(payload.event, payload.data as any)
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

/** 页面与 sharedworker 断开连接 */
ipc.handle('disconnect', (id) => {
  context.pages.delete(id)
  context.ports.delete(id)
})

// ====================    event listener    ====================

// sharedworker 下需要管理所有页面
if (Object.prototype.toString.call(globalThis) === '[object SharedWorkerGlobalScope]') {
  const scope = globalThis as SharedWorkerGlobalScope
  scope.addEventListener('connect', (ev) => {
    const id = crypto.randomUUID()
    context.pages.add(id)
    context.ports.set(id, ev.ports[0])
    ipc.emit('init', id)
    ipc.emit('statusChange', context.status)
    ipc.emit('delayChange', context.delay)
  })
}
// worker 下只需要管理单独页面
else {
  const id = crypto.randomUUID()
  ipc.emit('init', id)
  ipc.emit('statusChange', context.status)
  ipc.emit('delayChange', context.delay)
}
