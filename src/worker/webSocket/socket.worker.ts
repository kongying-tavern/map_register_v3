import type { Socket } from 'socket.io-client'
import { io } from 'socket.io-client'
import { isSharedWorker } from '@/utils/worker/utils'
import { WorkerIPC } from '@/utils/worker/worker-ipc'

declare const globalThis: WorkerGlobalScope

interface Page {
  id: string
  port: MessagePort
}

const context = {
  socket: null as Socket | null,
  delay: 999,
  openPromise: null as Promise<Socket> | null,
  pages: new Set<Page>(),
}

// DEBUG
Reflect.set(globalThis, 'context', context)

const ipc = new WorkerIPC<AppSocket.MainEventMap, AppSocket.WorkerEventMap>((message) => {
  if (isSharedWorker(globalThis)) {
    context.pages.forEach((page) => {
      page.port.postMessage(message)
    })
  }
  else {
    void (globalThis as DedicatedWorkerGlobalScope).postMessage(message)
  }
})

ipc.handle('open', async (url, options) => {
  if (context.socket) {
    const { query = {} } = context.socket.io.opts
    if (options.query.userId === query.userId) {
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

  ipc.emit('statusChange', 'CONNECTING')
  const socket = io(url, {
    path: options.path,
    query: options.query,
    transports: ['websocket'],
  })

  let pingTime = 0
  socket.io.engine.on('ping', () => {
    pingTime = Date.now()
  })
  socket.io.engine.on('pong', () => {
    context.delay = Date.now() - pingTime
    ipc.emit('delayChange', context.delay)
  })

  socket.on('connect', () => {
    resolve(socket)
    context.socket = socket
    context.openPromise = null
    ipc.emit('statusChange', 'OPEN')
  })

  socket.on('connect_error', () => {
    reject(new Error('Low level connection can not be established'))
    ipc.emit('statusChange', 'CLOSED')
  })

  socket.on('disconnect', () => {
    ipc.emit('statusChange', 'CLOSED')
  })

  context.openPromise = promise
  await promise
  return 'created'
})

ipc.handle('close', async () => {
  if (context.openPromise)
    await context.openPromise
  if (!context.socket)
    return
  context.socket.close()
  context.socket = null
})

const getStatus = () => {
  if (context.socket)
    return 'OPEN'
  if (context.openPromise)
    return 'CONNECTING'
  return 'CLOSED'
}

if (Object.prototype.toString.call(globalThis) === '[object SharedWorkerGlobalScope]') {
  const scope = globalThis as SharedWorkerGlobalScope
  scope.addEventListener('connect', (ev) => {
    const id = crypto.randomUUID()
    context.pages.add({
      id,
      port: ev.ports[0],
    })
    ipc.emit('init', id)
    ipc.emit('statusChange', getStatus())
    ipc.emit('delayChange', context.delay)
  })
}
else {
  const id = crypto.randomUUID()
  ipc.emit('init', id)
  ipc.emit('statusChange', getStatus())
  ipc.emit('delayChange', context.delay)
}
