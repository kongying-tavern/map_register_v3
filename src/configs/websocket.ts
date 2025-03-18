interface WebSocketWorkerConfig {
  /** 心跳包 */
  HEARTBEAT: {
    /** 心跳包发送间隔 */
    INTERVAL: number
    /** 超时判定时间 */
    TIMEOUT: number
  }
  /** 断线重连 */
  RECONNECT: {
    /** 重连等待时间 */
    DELAY: number
  }
}

/** 连接配置。出于稳定性考虑，连接参数不再通过运行时确定。 */
export const WEBSOCKET_WORKER_CONFIG: WebSocketWorkerConfig = {
  HEARTBEAT: {
    INTERVAL: 15000,
    TIMEOUT: 30000,
  },
  RECONNECT: {
    DELAY: 3000,
  },
}
