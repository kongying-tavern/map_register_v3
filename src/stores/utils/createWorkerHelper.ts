/**
 * Worker 包装函数
 * @param worker 必须按照如下类型输出结果
 * - string 类型表示错误原因
 * - 对象类型表示成功结果
 */
export const createWorkerHelper = <Input, Output>(worker: Worker) => {
  return (payload: Input) => new Promise<Output>((resolve, reject) => {
    worker.onmessage = (ev: MessageEvent<Output | string>) => {
      const { data } = ev
      worker.terminate()
      if (typeof data === 'string')
        return reject(new Error(data))
      resolve(data)
    }
    worker.postMessage(payload)
  })
}
