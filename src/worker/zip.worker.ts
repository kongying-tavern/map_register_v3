import SevenZip from '7z-wasm'
import type { Logger } from '@/utils/logger'
import { formatByteSize } from '@/utils/formatByteSize'
import { useLoggerWorker } from '@/hooks/useWorkerLogger'

export {}

declare const globalThis: DedicatedWorkerGlobalScope

export interface WorkerInput {
  data: Uint8Array
  wasm: ArrayBuffer
  name: string
}

export type WorkerSuccessOutput = Uint8Array | string

export type WorkerOutput = Uint8Array | string

/** 解压文件 */
const decompressFile = async (options: WorkerInput, logger: Logger): Promise<Uint8Array> => {
  const { data, wasm, name } = options

  const zip = await SevenZip({
    wasmBinary: wasm,
    stdout: code => logger.stdout.write(String.fromCharCode(code)),
  })

  const tempFilename = `${name}.bin`
  const stream = zip.FS.open(tempFilename, 'w+')
  zip.FS.write(stream, data, 0, data.length)
  zip.FS.close(stream)

  // 解压，详细用法见 7-zip 命令行帮助
  zip.callMain(['x', tempFilename, '-y'])

  logger.info('已解压', {
    file: tempFilename,
    size: formatByteSize(zip.FS.stat(name).size, { binary: true }),
  })

  const res = zip.FS.readFile(name)

  return res
}

globalThis.addEventListener('message', async (ev: MessageEvent<WorkerInput>) => {
  const { send, logger } = useLoggerWorker<WorkerInput, WorkerOutput>(ev, 'Zip')

  try {
    const res = await decompressFile(ev.data, logger)
    send(res, [res.buffer])
  }
  catch (err) {
    logger.error(err instanceof Error ? err.message : `${err}`)
    send(err instanceof Error ? err.message : `${err}`)
  }
})
