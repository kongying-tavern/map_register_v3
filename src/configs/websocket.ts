interface WebSocketWorkerConfig {
  /** 心跳包 */
  HEARTBEAT: {
    /** Ping 发送间隔（ms） */
    INTERVAL: number
    /** 发出 Ping 后等待 Pong 的超时（ms），超时即判定断线并重建连接 */
    TIMEOUT: number
  }
  /** 断线重连 */
  RECONNECT: {
    /** 首次重连等待（ms），此后按指数退避翻倍 */
    INITIAL_DELAY: number
    /** 重连等待上限（ms） */
    MAX_DELAY: number
  }
}

/** 连接配置。出于稳定性考虑，连接参数不再通过运行时确定。 */
export const WEBSOCKET_WORKER_CONFIG: WebSocketWorkerConfig = {
  HEARTBEAT: {
    // 对齐 Rust 契约（ws-frontend-contract）：客户端每 30s 发 {"action":"Ping"}
    INTERVAL: 30_000,
    TIMEOUT: 30_000,
  },
  RECONNECT: {
    INITIAL_DELAY: 1_000,
    MAX_DELAY: 30_000,
  },
}
