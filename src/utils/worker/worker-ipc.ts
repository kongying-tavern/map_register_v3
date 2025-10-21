import type {
  EventMap,
  ResponseMessage,
} from './types'
import { isRequest, isSharedWorker } from './utils'

declare const globalThis: DedicatedWorkerGlobalScope | SharedWorkerGlobalScope
type Handler<A extends unknown[] = unknown[], T = void> = (...args: A) => T
type MaybePromise<T> = Promise<T> | T
interface PortLike {
  postMessage: MessagePort['postMessage']
}

export class WorkerIPC<
  MainEvents extends EventMap,
  WorkerEvents extends EventMap,
> {
  #handlers: Map<keyof MainEvents, Handler> = new Map()
  #messageSender: (message: unknown) => void

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

  constructor(messageSender: (message: unknown) => void) {
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

    globalThis.addEventListener('message', this.#createMessageListener(globalThis))
  }

  /**
   * ### 处理来自主线程的事件
   * - 同名 handler 只能注册一个
   */
  handle<C extends keyof MainEvents>(
    channel: C,
    handler: Handler<MainEvents[C]['args'], MaybePromise<MainEvents[C]['return']>>,
  ): void {
    if (this.#handlers.has(channel))
      throw new Error(`Attempted to register a second handler for '${String(channel)}'`)
    this.#handlers.set(channel, handler)
  }

  removeHandler<C extends keyof MainEvents>(
    channel: C,
    handler: (...args: MainEvents[C]['args']) => MaybePromise<MainEvents[C]['return']>,
  ): void {
    this.#handlers.set(channel, handler)
  }

  emit<C extends keyof WorkerEvents>(
    channel: C,
    ...args: WorkerEvents[C]['args']
  ): void {
    this.#messageSender({
      type: 'request',
      channel,
      args,
    })
  }
}
