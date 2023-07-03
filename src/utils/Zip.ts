import ZipWorker from '@/worker/zip.worker?worker'
import type { ZipWorkerMessage, ZipWorkerPayload } from '@/worker/zip.worker'

/** 7-zip 包装类 */
export class Zip {
  /**
   * 解压缩文件
   * @param file 需要被解压的文件
   */
  static decompress = (file: Uint8Array) => new Promise<Uint8Array>((resolve, reject) => {
    const worker = new ZipWorker()

    worker.postMessage({
      data: file,
      log: true,
    } as ZipWorkerPayload, [file.buffer])

    worker.onmessage = (ev: MessageEvent<ZipWorkerMessage>) => {
      const { data } = ev

      worker.terminate()

      if (typeof data === 'string')
        return reject(new Error(data))

      resolve(data)
    }
  })
}
