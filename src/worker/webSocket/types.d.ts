import type { SocketWorkerEvent } from '@/shared'

export declare namespace WS {
  /** 与 SharedWorker 进行通信时的消息格式 */
  interface Message<T extends SocketWorkerEvent = SocketWorkerEvent> {
    /** 事件名称 */
    event: T
    /** 负载 */
    data: WorkerDataMap[T]
    /** 错误原因 */
    message?: string
    /** 消息 id，用于生成回应 */
    id: string
  }

  interface WorkerDataMap {
    /**
     * @both Message Id
     */
    [SocketWorkerEvent.Confirm]: string

    /**
     * @main url
     */
    [SocketWorkerEvent.Open]: string

    /**
     * @main
     */
    [SocketWorkerEvent.Close]: {
      code: number
      reason: string
    }

    /**
     * @worker WebSocket Status
     */
    [SocketWorkerEvent.StatusChange]: number

    /**
     * @worker Connect Delay
     */
    [SocketWorkerEvent.DelayChange]: number

    /**
     * @worker
     */
    [SocketWorkerEvent.Message]: API.WSData

    /**
     * @main Port Id
     */
    [SocketWorkerEvent.Unload]: void
  }

  type WorkerEventMap = {
    [K in SocketWorkerEvent]: [data: Message<K>['data'], portId: string]
  }
}
