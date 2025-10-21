export class WorkerError extends Error {
  constructor(message: string, options?: ErrorOptions & { stack?: string }) {
    super(message, {
      cause: options?.cause,
    })
    this.stack = options?.stack
  }
}
