import type { WS } from './types'
import { SocketCloseReason, SocketStatus, SocketWorkerEvent } from '@/shared/socket'
import { EventBus } from '@/utils/EventBus'
import { filter, Subject, tap } from 'rxjs'
import { SocketController } from './socketController'

interface WebSocketClient extends EventTarget {
  postMessage: (data: unknown, transfer: Transferable[]) => void
  close: () => void
}

interface ClientMessage {
  client: WebSocketClient
  clientId: string
  event: MessageEvent<WS.Message>
}

declare const globalThis: (SharedWorkerGlobalScope | DedicatedWorkerGlobalScope)

// ==================== state ====================

/** 用于维护连接客户端 */
const socketClients = new Map<string, WebSocketClient>()

/** 事件总线 */
const workerEvent = new EventBus<WS.WorkerEventMap>()

const ws = new SocketController({
  broadcast: (message, transfer = []) => {
    socketClients.forEach((port) => {
      port.postMessage(message, transfer)
    })
  },
})

const clientMessage$ = new Subject<ClientMessage>()

clientMessage$.pipe(
  filter(clientMessage => clientMessage.event.data.event !== SocketWorkerEvent.Confirm),
  tap(({ client, clientId, event }) => {
    client.postMessage({
      event: SocketWorkerEvent.Confirm,
      data: event.data.id,
    }, [])
    // eslint-disable-next-line ts/no-explicit-any
    workerEvent.emit(event.data.event, event.data.data as any, clientId)
  }),
).subscribe()

// ==================== 主线程操作处理 ====================

workerEvent.on(SocketWorkerEvent.Open, (url) => {
  ws.open(url)
})

workerEvent.on(SocketWorkerEvent.Close, ({ reason }) => {
  ws.close(reason as SocketCloseReason)
})

workerEvent.on(SocketWorkerEvent.Unload, (_, id) => {
  const client = socketClients.get(id)
  if (!client)
    return
  client.close()
  socketClients.delete(id)
  if (socketClients.size < 1)
    ws.close(SocketCloseReason.ALL_PORTS_CLOSED)
})

// ==================== 主线程接入 ====================

/** 初始化标签页的 ws 状态 */
const initClientStatus = (client: WebSocketClient) => {
  client.postMessage(<WS.Message>{
    id: crypto.randomUUID(),
    event: SocketWorkerEvent.StatusChange,
    data: ws.instance?.readyState ?? SocketStatus.INIT,
  }, [])
}

if (Object.prototype.toString.call(globalThis) === '[object SharedWorkerGlobalScope]') {
  void (<SharedWorkerGlobalScope>globalThis).addEventListener('connect', (connectEvent: MessageEvent<WS.Message>) => {
    const client = connectEvent.ports[0]
    const clientId = crypto.randomUUID()

    socketClients.set(clientId, client)

    client.addEventListener('message', (event: MessageEvent<WS.Message>) => clientMessage$.next({
      client,
      clientId,
      event,
    }))
    client.start()

    initClientStatus(client)
  })
  void (<SharedWorkerGlobalScope>globalThis).addEventListener('error', (ev) => {
    console.log('[error]', ev.message)
  })
}
// HACK 兼容移动端 Chrome
else {
  ((client: DedicatedWorkerGlobalScope) => {
    const clientId = crypto.randomUUID()

    socketClients.set(clientId, client)

    client.addEventListener('message', (event: MessageEvent<WS.Message>) => clientMessage$.next({
      client,
      clientId,
      event,
    }))

    initClientStatus(client)
  })(globalThis as DedicatedWorkerGlobalScope)
}
