import type { Type } from 'protobufjs'
import { load } from 'protobufjs'

/** Protobuf 解码器缓存，用于存储已编译的解码器 */
const decoderCache = new Map<string, Type>()

/** 正在加载中的 Promise 缓存，用于防止重复加载相同的 proto 文件 */
const loadPromises = new Map<string, Promise<Type>>()

/**
 * 编译并缓存 Protobuf 解码器
 *
 * 该函数会加载指定的 proto 文件，查找并返回对应的 message 类型解码器。
 * 支持缓存机制，避免重复加载相同的 proto 文件。
 * 支持并发调用，多个同时请求会共享同一个加载 Promise。
 *
 * @param protoUrl - Proto 文件的 URL 路径（支持 Vite 的 ?url 导入方式）
 * @param packageName - 要查找的 message 类型的完整名称（格式：package.TypeName，如 'protobuf.MarkerDiffSnapshotVoList'）
 * @returns Promise<Type> 返回 protobufjs 的 Type 对象，可用于解码二进制数据
 *
 * @example
 * ```typescript
 * // 基础用法
 * import ProtobufUrl from '@/api/protobuf/MarkerDiffSnapshotVo.proto?url'
 * import { compileProtobufDecoder } from '@/utils/compile-protobuf-decoder'
 *
 * // 获取解码器
 * const decoder = await compileProtobufDecoder(
 *   ProtobufUrl,
 *   'protobuf.MarkerDiffSnapshotVoList'
 * )
 *
 * // 使用解码器解码二进制数据
 * const buffer = await fetch('/api/binary-data').then(r => r.arrayBuffer())
 * const data = decoder.decode(new Uint8Array(buffer))
 * console.log(data) // 解码后的对象
 * ```
 *
 * @example
 * ```typescript
 * // 在组件或 Store 中使用（支持缓存，多次调用不会重复加载）
 * import { compileProtobufDecoder } from '@/utils/compile-protobuf-decoder'
 * import ProtobufUrl from '@/api/protobuf/MarkerDiffSnapshotVo.proto?url'
 *
 * // 第一次调用会加载文件
 * const decoder1 = await compileProtobufDecoder(ProtobufUrl, 'protobuf.MarkerDiffSnapshotVoList')
 *
 * // 第二次调用会直接返回缓存的结果（不会重新加载）
 * const decoder2 = await compileProtobufDecoder(ProtobufUrl, 'protobuf.MarkerDiffSnapshotVoList')
 * // decoder1 === decoder2 (同一个对象引用)
 * ```
 *
 * @throws {Error} 当 proto 文件加载失败时抛出错误
 * @throws {Error} 当指定的 packageName 不存在时抛出错误
 */
export const compileProtobufDecoder = async (
  protoUrl: string,
  packageName: string,
) => {
  // 使用 protoUrl 和 packageName 组合作为缓存键
  const key = `${protoUrl}:${packageName}`

  // 检查是否已有缓存的解码器
  const cachedDecoder = decoderCache.get(key)
  if (cachedDecoder)
    return cachedDecoder

  // 检查是否已有正在加载中的 Promise（处理并发请求）
  const cachedPromise = loadPromises.get(key)
  if (cachedPromise)
    return cachedPromise

  // 创建新的加载 Promise
  const promise = new Promise<Type>((resolve, reject) => {
    load(protoUrl, (err, root) => {
      try {
        // 处理加载错误
        if (err) {
          loadPromises.delete(key)
          return reject(err)
        }
        // 处理 root 为 null 的情况
        if (!root) {
          loadPromises.delete(key)
          return reject(new Error('Protobuf 加载失败'))
        }
        // 查找指定的 message 类型
        const decoder = root.lookupType(packageName)
        // 缓存解码器以供后续使用
        decoderCache.set(key, decoder)
        // 清理加载中的 Promise 缓存
        loadPromises.delete(key)
        resolve(decoder)
      }
      catch (error) {
        // 处理 lookupType 可能抛出的异常（如类型不存在）
        loadPromises.delete(key)
        reject(error)
      }
    })
  })
  // 将 Promise 加入缓存，以便并发请求可以共享
  loadPromises.set(key, promise)

  return promise
}
