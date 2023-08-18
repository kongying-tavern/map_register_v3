import SevenZipWASM from '7z-wasm/7zz.wasm?url'
import ZipWorker from '@/worker/zip.worker?worker'
import type { ZipWorkerMessage, ZipWorkerPayload } from '@/worker/zip.worker'

/** 7-zip 包装类 */
export class Zip {
  static #zipWasmBinary = fetch(SevenZipWASM).then(res => res.arrayBuffer())

  /**
   * 解压缩文件
   * @param file 需要被解压的文件
   */
  static decompress = async (file: Uint8Array) => {
    const wasm = await this.#zipWasmBinary

    return new Promise<Uint8Array>((resolve, reject) => {
      const worker = new ZipWorker()

      worker.postMessage({
        data: file,
        log: true,
        wasm,
      } as ZipWorkerPayload, [file.buffer, wasm.slice(0)])

      worker.onmessage = (ev: MessageEvent<ZipWorkerMessage>) => {
        const { data } = ev

        worker.terminate()

        if (typeof data === 'string')
          return reject(new Error(data))

        resolve(data)
      }
    })
  }
}
