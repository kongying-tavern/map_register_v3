import { decompress } from 'bz2'

/** 解压缩后返回文件 */
self.onmessage = (ev: MessageEvent<Uint8Array | string | undefined>) => {
  const { data } = ev

  // 当接收到终止信号时结束线程
  if (typeof data === 'string') {
    data === 'terminate' && self.close()
    return
  }

  try {
    if (!data)
      throw new Error('未传递文件')
    // TODO 切换为 bz2 官方库的 WASM 实现
    // bz2 的库解压出来很多字符编码为 \x00 的空字符（不是空格），疑似 bug
    // 但是鉴于该库已经 4 年没更新了，这里临时处理一下
    self.postMessage(decompress(data, false).filter(unit => unit !== 0))
  }
  catch (err) {
    self.postMessage((err as Error).message)
  }
}
