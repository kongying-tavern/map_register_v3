import { Logger } from '.'

export interface WorkerHelperOptions {
  label?: string
}

/**
 * Worker 包装函数
 * @param worker 必须按照如下类型输出结果
 * - string 类型表示错误原因
 * - 对象类型表示成功结果
 */
export const createWorkerHelper = <Input, Output>(worker: Worker, options: WorkerHelperOptions = {}) => {
  const { label = 'worker' } = options

  const logger = new Logger(`·${label}`)

  return (payload: Input) => new Promise<Output>((resolve, reject) => {
    const mainChannel = new MessageChannel()
    const loggerChannel = new MessageChannel()

    mainChannel.port1.onmessage = (ev: MessageEvent<Output | string>) => {
      const { data } = ev
      if (typeof data === 'string')
        return reject(new Error(data))
      resolve(data)
    }

    loggerChannel.port1.onmessage = (ev: MessageEvent<{ type: 'info' | 'warn' | 'error'; message: unknown[] }>) => {
      const { type, message } = ev.data
      logger[type](...message)
    }

    worker.postMessage(payload, [mainChannel.port2, loggerChannel.port2])
  })
}
