/** 主线程与 socket 所在的 sharedworker 通信时的事件 */
export enum SocketWorkerEvent {
  /**
   * 确认收到消息
   * @main @worker
   */
  Confirm = 0,

  /**
   * 建立连接
   * @main
   */
  Open = 1,

  /**
   * 关闭连接
   * @main
   */
  Close = 2,

  /**
   * 连接状态改变
   * @worker
   */
  StatusChange = 3,

  /**
   * 时延改变
   * @worker
   */
  DelayChange = 4,

  /**
   * 收到服务端消息
   * @worker
   */
  Message = 5,

  /**
   * 页面卸载
   * @main
   */
  Unload = 6,
}

/** Socket 关闭的原因，用于实现断线重连等操作 */
export enum SocketCloseReason {
  /** 用户主动关闭 */
  CLOSED_BY_USER = 'CLOSED_BY_USER',

  /** 连接至 SharedWorker 的所有标签页都已经关闭 */
  ALL_PORTS_CLOSED = 'ALL_PORTS_CLOSED',

  /** 因为 url 改变而关闭 */
  URL_CHANGED = 'URL_CHANGED',
}
