/** web socket 连接配置 */
interface SocketHookOptions {
  getURL: () => string | undefined
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
