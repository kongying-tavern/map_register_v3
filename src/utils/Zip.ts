import type { WorkerInput } from '@/worker/zip.worker'
import SevenZipWASM from '7z-wasm/7zz.wasm?url'
import ZipWorker from '@/worker/zip.worker?worker'
import { createWorkerHelper } from '.'

/** 7-zip 包装类 */
export class Zip {
  static #zipWasmBinary = fetch(SevenZipWASM).then(res => res.arrayBuffer())

  /**
   * 压缩文件
   * @param file 需要被压缩的文件
   */
  static compress = async (file: Uint8Array, name = 'temp') => {
    const wasm = await this.#zipWasmBinary

    const copyZipWasm = wasm.slice(0)

    const process = createWorkerHelper<WorkerInput, Uint8Array>(new ZipWorker({ name: '压缩线程' }), {
      cacheWorker: false,
    })

    const compressedData = await process({
      type: 'compress',
      data: file,
      name,
      wasm: copyZipWasm,
    }, [file.buffer, copyZipWasm])

    return compressedData
  }

  /**
   * 以 JSON 进行压缩
   */
  static compressFrom = async <T>(data: T, options: CompressFromObjectOptions = {}) => {
    const { name } = options
    const bufferData = new TextEncoder().encode(JSON.stringify(data))
    const compressedData = await this.compress(bufferData, name)
    return compressedData
  }

  /**
   * 解压缩文件
   * @param file 需要被解压的文件
   */
  static decompress = async (file: Uint8Array, name = 'temp') => {
    const wasm = await this.#zipWasmBinary

    const copyZipWasm = wasm.slice(0)

    const process = createWorkerHelper<WorkerInput, Uint8Array>(new ZipWorker({ name: '解压线程' }), {
      cacheWorker: false,
    })

    const decompressedData = await process({
      type: 'decompress',
      data: file,
      name,
      wasm: copyZipWasm,
    }, [file.buffer, copyZipWasm])

    return decompressedData
  }

  /**
   * 解压后作为 JSON 进行解析
   */
  static decompressAs = async <T>(file: Uint8Array, options: DecompressAsObjectOptions = {}) => {
    const { utfLabel = 'utf-8', name } = options
    const decomcompressedData = await this.decompress(file, name)
    const stringData = new TextDecoder(utfLabel).decode(decomcompressedData.buffer)
    return JSON.parse(stringData) as T
  }
}

export interface CompressFromObjectOptions {
  /** 临时文件的文件名，用于 debug */
  name?: string
}

export interface CompressFromObjectOptions {
  /** 临时文件的文件名，用于 debug */
  name?: string
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
