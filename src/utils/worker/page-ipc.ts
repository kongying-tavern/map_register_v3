import type {
  EventMap,
  PortLike,
  RequestMessage,
  Resolver,
} from './types'
import { isRequest, isResponse } from './utils'
import { WorkerError } from './worker-error'

export class PageIPC<
  MainEvents extends EventMap = EventMap,
  WorkerEvents extends EventMap = EventMap,
> {
  #port: PortLike
  #resolvers = new Map<string, Resolver>()

  constructor(worker: Worker | SharedWorker) {
    if (typeof window === 'undefined')
      throw new Error('PageIPC 只能在渲染线程中使用')
    if (!(worker instanceof Worker) && !(worker instanceof SharedWorker))
      throw new Error('必须提供合法的 Worker 或 SharedWorker 实例')

    if (worker instanceof Worker) {
      this.#port = worker
    }
    else {
      worker.port.start()
      this.#port = worker.port
    }

    this.#port.addEventListener('message', (ev) => {
      const { data } = ev
      if (!isResponse(data))
        return
      const resolver = this.#resolvers.get(data.id)
      if (!resolver)
        return
      if (data.error) {
        resolver.reject(new WorkerError(data.error.message, {
          stack: data.error.stack,
        }))
        return
      }
      resolver.resolve(data.result)
      this.#resolvers.delete(data.id)
    })
  }

  /** 请求 worker 线程完成指定的任务 */
  async invoke<C extends keyof MainEvents>(
    channel: C,
    ...args: MainEvents[C]['args']
  ): Promise<MainEvents[C]['return']> {
    const id = crypto.randomUUID()
    return new Promise<MainEvents[C]['return']>((resolve, reject) => {
      this.#resolvers.set(id, { resolve, reject })
      const payload = {
        type: 'request',
        channel: channel as string,
        id,
        args,
      } satisfies RequestMessage<MainEvents[C]['args']>
      this.#port.postMessage(payload)
    })
  }

  /** 监听 worker 线程发送的事件 */
  on<C extends keyof WorkerEvents>(
    channel: C,
    handler: (...args: WorkerEvents[C]['args']) => void,
  ) {
    const listenerWrapper = (ev: MessageEvent) => {
      const { data } = ev
      if (!isRequest(data))
        return
      if (data.channel !== channel)
        return
      handler(...data.args)
    }
    this.#port.addEventListener('message', listenerWrapper)
    return () => {
      this.#port.removeEventListener('message', listenerWrapper)
    }
  }
}
