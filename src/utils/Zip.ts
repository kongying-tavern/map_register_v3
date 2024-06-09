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
  static decompress = async (file: Uint8Array, name = 'temp') => {
    const wasm = await this.#zipWasmBinary

    return new Promise<Uint8Array>((resolve, reject) => {
      const worker = new ZipWorker()

      const copyZipWasm = wasm.slice(0)

      worker.postMessage({
        data: file,
        name,
        log: true,
        wasm: copyZipWasm,
      } as ZipWorkerPayload, [file.buffer, copyZipWasm])

      worker.onmessage = (ev: MessageEvent<ZipWorkerMessage>) => {
        const { data } = ev

        worker.terminate()

        if (typeof data === 'string')
          return reject(new Error(data))

        resolve(data)
      }
    })
  }

  /**
   * 解压后作为 JSON 进行解析
   */
  static decompressAs = async <T>(file: Uint8Array, options: DecompressAsObjectOptions = {}) => {
    const { utfLabel = 'utf-8', name } = options
    const depressedData = await this.decompress(file, name)
    const stringData = new TextDecoder(utfLabel).decode(depressedData.buffer)
    return JSON.parse(stringData) as T
  }
}

export interface DecompressAsObjectOptions {
  /**
   * 文本的二进制编码
   * @default 'utf-8'
   */
  utfLabel?: string

  /** 临时文件的文件名，用于 debug */
  name?: string
}
