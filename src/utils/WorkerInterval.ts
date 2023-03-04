import IntervalWorker from '@/worker/intervalWorker?worker'

/** 基于 worker 线程的定时任务，以避免主线程重负载阻塞所造成的定时误差 */
export class WorkerInterval {
  private static worker: Worker = new IntervalWorker()
  private static intervalMap: Record<string, Function> = {}

  // 初始化
  static {
    this.worker.onmessage = (ev: MessageEvent<string>) => {
      this.intervalMap[ev.data]?.()
    }
  }

  static set = (name: string, fn: Function, interval: number) => {
    this.intervalMap[name] = fn
    this.worker.postMessage(JSON.stringify({ name, interval, action: 'set' }))
  }

  static clear = (name: string) => {
    delete this.intervalMap[name]
    this.worker.postMessage(JSON.stringify({ name, action: 'clear' }))
  }
}
