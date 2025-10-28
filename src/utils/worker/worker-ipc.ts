import type {
  EventMap,
  RequestMessage,
  ResponseMessage,
} from './types'
import { isRequest, isServiceWorker, isSharedWorker } from './utils'

declare const globalThis: DedicatedWorkerGlobalScope | SharedWorkerGlobalScope | ServiceWorkerGlobalScope
type Handler<A extends unknown[] = unknown[], T = void> = (...args: A) => MaybePromise<T>
type MaybePromise<T> = Promise<T> | T
interface PortLike {
  postMessage: MessagePort['postMessage']
}

export class WorkerIPC<
  MainEvents extends EventMap = EventMap,
  WorkerEvents extends EventMap = EventMap,
> {
  #handlers: Map<keyof MainEvents, Handler> = new Map()
  #messageSender: (request: RequestMessage<WorkerEvents[keyof WorkerEvents]['args']>) => void

  #createMessageListener = (port: PortLike) => {
    return async (ev: MessageEvent<unknown>) => {
      const { data } = ev
      if (!isRequest(data))
        return
      const handler = this.#handlers.get(data.channel)
      try {
        if (!handler)
          throw new Error(`Channel ${data.channel} is unhandle`)
        const result = await handler(...data.args)
        const response = {
          type: 'response',
          id: data.id,
          result,
        } satisfies ResponseMessage
        port.postMessage(response)
      }
      catch (err) {
        const { message, stack } = err as Error
        port.postMessage({
          type: 'response',
          id: data.id,
          error: { message, stack },
        } satisfies ResponseMessage<never>)
      }
    }
  }

  constructor(messageSender: (request: RequestMessage<WorkerEvents[keyof WorkerEvents]['args']>) => void) {
    this.#messageSender = messageSender
    if (!(globalThis instanceof WorkerGlobalScope)) {
      throw new TypeError('WorkerIPC can only be used in a Worker Scope')
    }

    if (isSharedWorker(globalThis)) {
      globalThis.addEventListener('connect', (ev) => {
        const port = ev.ports[0]
        port.addEventListener('message', this.#createMessageListener(port))
        port.start()
      })
      return
    }

    // ServiceWorker 不支持事件监听
    if (isServiceWorker(globalThis))
      return

    globalThis.addEventListener('message', this.#createMessageListener(globalThis))
  }

  /**
   * ### 处理来自主线程的事件
   * - 同名 handler 只能注册一个
   */
  handle = <C extends keyof MainEvents>(
    channel: C,
    handler: Handler<MainEvents[C]['args'], MaybePromise<MainEvents[C]['return']>>,
  ): void => {
    if (this.#handlers.has(channel))
      throw new Error(`Attempted to register a second handler for '${String(channel)}'`)
    this.#handlers.set(channel, handler as Handler)
  }

  /** 移除 handler */
  removeHandler = <C extends keyof MainEvents>(
    channel: C,
    handler: (...args: MainEvents[C]['args']) => MaybePromise<MainEvents[C]['return']>,
  ): void => {
    this.#handlers.set(channel, handler as Handler)
  }

  /** 向主线程发送事件 */
  emit = <C extends keyof WorkerEvents>(
    channel: C,
    ...args: WorkerEvents[C]['args']
  ): void => {
    this.#messageSender({
      id: crypto.randomUUID(),
      type: 'request',
      channel: channel as string,
      args,
    })
  }
}
