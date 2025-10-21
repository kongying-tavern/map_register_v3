declare namespace AppSocket {
  /** 主线程可以发送的事件 */
  // eslint-disable-next-line ts/consistent-type-definitions
  type MainEventMap = {
    /** 开启 socket 连接 */
    open: {
      args: [url: string, options: {
        path: string
        query: {
          userId: string
        }
      }]
      return: 'created' | 'reused'
    }
    /** 关闭 socket 连接 */
    close: {
      args: []
      return: void
    }
    /** 页面与 sharedworker 断开连接 */
    disconnect: {
      args: [id: string]
      return: void
    }
  }

  /** worker 线程可以发送的事件 */
  type WorkerEventMap = {
    /** 分配页面 id */
    init: {
      args: [id: string]
      return: void
    }
    /** socket 状态改变 */
    statusChange: {
      args: [status: SocketStatus]
      return: void
    }
  } & {
    [K in keyof API.WSEventMap]: {
      args: API.WSEventMap[K]
      return: void
    }
  }

  /** 主线程 ws 上下文 */
  interface MainContext {
    /** 页面 id */
    id: string
    /** socket 状态 */
    status: Status
    /** 当前延迟 */
    delay: number
  }

  /** socket 当前状态 */
  type Status =
    | 'INIT' // 初始化，主线程请求 sharedworker 中 socket 的状态
    | 'CONNECTING' // 连接中
    | 'OPEN' // 已连接
    | 'CLOSING' // 连接断开中
    | 'CLOSED' // 已断开
}
