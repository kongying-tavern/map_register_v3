import type { WorkerIPC } from '@/utils/worker/worker-ipc'

export class ServiceWorkerLogger {
  #ipc: WorkerIPC<never, AppServiceWorker.EventMap>

  constructor(ipc: WorkerIPC<never, AppServiceWorker.EventMap>) {
    this.#ipc = ipc
  }

  info = (message: string) => {
    this.#ipc.emit('log', 'info', message)
  }

  error = (message: string) => {
    this.#ipc.emit('log', 'error', message)
  }
}
