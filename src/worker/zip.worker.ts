import SevenZip from '7z-wasm'
import { Logger } from '@/utils/logger'

export {}

declare const globalThis: DedicatedWorkerGlobalScope

export interface ZipWorkerPayload {
  data: Uint8Array
  wasm: ArrayBuffer
  name: string
  log?: boolean
}

export type ZipWorkerMessage = Uint8Array | string

/** 解压文件 */
const decompressFile = async (options: ZipWorkerPayload): Promise<Uint8Array> => {
  const { data, wasm, name, log = false } = options

  const logger = new Logger('·Zip', () => log)

  const zip = await SevenZip({
    wasmBinary: wasm,
    stdout: code => logger.stdout.write(String.fromCharCode(code)),
  })

  const tempFilename = `${name}.bin`
  logger.info(`正在解压 ${tempFilename}`)

  const stream = zip.FS.open(tempFilename, 'w+')
  zip.FS.write(stream, data, 0, data.length)
  zip.FS.close(stream)

  // 解压，详细用法见 7-zip 命令行帮助
  zip.callMain(['x', tempFilename, '-y'])

  logger.info(`${tempFilename} 解压完毕，文件大小：${zip.FS.stat(name).size}`)

  const res = zip.FS.readFile(name)

  return res
}

/** 消息处理 */
globalThis.addEventListener('message', async (ev: MessageEvent<ZipWorkerPayload>) => {
  try {
    const extractFile = await decompressFile(ev.data)
    globalThis.postMessage(extractFile as ZipWorkerMessage, [extractFile.buffer])
  }
  catch (err) {
    globalThis.postMessage((err as Error).message as ZipWorkerMessage)
  }
})
