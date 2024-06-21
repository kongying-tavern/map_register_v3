/** web socket 连接配置 */
interface SocketHookOptions {
  /** 路径参数，每次建立连接时都会重新获取 */
  params?: () => Record<string, unknown>
  /** 查询参数，每次建立连接时都会重新获取 */
  query?: () => Record<string, unknown>
}

/** 发送至 SharedWorker 的连接配置 */
interface SocketWorkerOptions {
  heartbeatInterval: number
  heartbeatTimeout: number
  reconnectCount: number
  reconnectDelay: number
  retryCount: number
  retryDelay: number
}
