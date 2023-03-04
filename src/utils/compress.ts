import CompressWorker from '@/worker/compressWorker?worker'

/** bz2 压缩文件管理 (pure js + worker 方案) */
export class Compress {
  /**
   * 解压缩文件
   * @param file 需要被解压的文件(目前支持 bz2)
   * @param waittingTime 最大等待时间(ms)，超过则结束任务并返回超时错误，默认 5 秒
   */
  static decompress = async (file: Uint8Array, waittingTime = 5000) => new Promise<Uint8Array>((resolve, reject) => {
    const worker = new CompressWorker()
    let isFulfilled = false

    worker.postMessage(file, [file.buffer])

    /** 终止线程 */
    const terminate = () => {
      worker.postMessage('terminate')
    }

    setTimeout(() => {
      if (isFulfilled)
        return
      terminate()
      isFulfilled = true
      reject(new Error('任务超时'))
    }, waittingTime)

    worker.onmessage = (ev: MessageEvent<string | Uint8Array>) => {
      if (isFulfilled)
        return
      isFulfilled = true
      const { data } = ev
      terminate()
      typeof data === 'string' ? reject(new Error(data)) : resolve(data)
    }
  })
}
