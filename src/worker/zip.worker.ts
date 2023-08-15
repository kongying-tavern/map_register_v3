import SevenZip from '7z-wasm'
import SevenZipWASM from '7z-wasm/7zz.wasm?url'
import { Logger } from '@/utils/logger'

// import SevenZipWASM from '@/wasm/7zz.wasm?url'
export interface ZipWorkerPayload {
  data: Uint8Array
  log?: boolean
}

export type ZipWorkerMessage = Uint8Array | string

const logger = new Logger('[Zip Worker]')

/** 解压文件 */
const decompressFile = async (data: Uint8Array, log = false): Promise<Uint8Array> => {
  const wasmBinary = await fetch(SevenZipWASM).then(res => res.arrayBuffer())
  const zip = await SevenZip({
    wasmBinary,
    stdout: code => log ? logger.stdout.write(String.fromCharCode(code)) : 0,
  })

  const tempFilename = 'temp.bin'
  const extractedFilename = 'temp'

  const stream = zip.FS.open(tempFilename, 'w+')
  zip.FS.write(stream, data, 0, data.length)
  zip.FS.close(stream)

  // 解压，详细用法见 7-zip 命令行帮助
  zip.callMain(['x', tempFilename, '-y'])
  const res = zip.FS.readFile(extractedFilename)

  return res
}

/** 消息处理 */
self.onmessage = async (ev: MessageEvent<ZipWorkerPayload>) => {
  const { data: options } = ev
  const { data, log } = options
  try {
    const extractFile = await decompressFile(data, log)
    self.postMessage(extractFile as ZipWorkerMessage, [extractFile.buffer])
  }
  catch (err) {
    self.postMessage((err as Error).message as ZipWorkerMessage)
  }
}
