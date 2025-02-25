import type { IntervalPayload } from '@/worker/interval.worker'
import IntervalWorker from '@/worker/interval.worker?worker'

/** 基于 worker 线程的定时任务，以避免主线程重负载阻塞所造成的定时误差 */
export class WorkerInterval {
  private static worker: Worker = new IntervalWorker({ name: '定时器线程' })
  private static intervalMap: Record<string, (...args: unknown[]) => void> = {}

  // 初始化
  static {
    this.worker.onmessage = (ev: MessageEvent<string>) => {
      this.intervalMap[ev.data]?.()
    }
  }

  static set = (name: string, fn: (...args: unknown[]) => void, interval: number) => {
    this.intervalMap[name] = fn
    this.worker.postMessage({ name, interval, action: 'set' } as IntervalPayload)
  }

  static clear = (name: string) => {
    delete this.intervalMap[name]
    this.worker.postMessage({ name, action: 'clear' } as IntervalPayload)
  }
}
