export type EventHandler<P> = (...payloads: P extends unknown[] ? P : []) => void

export class EventBus<EventMap> {
  // eslint-disable-next-line ts/no-explicit-any
  #handlers: Record<any, any[]> = {}

  on = <T extends keyof EventMap>(event: T, handler: EventHandler<EventMap[T]>): void => {
    if (!this.#handlers[event])
      this.#handlers[event] = []
    this.#handlers[event].push(handler)
  }

  once = <T extends keyof EventMap>(event: T, handler: EventHandler<EventMap[T]>): void => {
    const onceHandler: EventHandler<EventMap[T]> = (...payloads) => {
      handler(...payloads)
      this.off(event, onceHandler)
    }
    this.on(event, onceHandler)
  }

  emit = <T extends keyof EventMap>(event: T, ...payloads: EventMap[T] extends unknown[] ? EventMap[T] : []): void => {
    const eventHandlers = this.#handlers[event]
    if (eventHandlers)
      eventHandlers.forEach(handler => handler(...payloads))
  }

  off = <T extends keyof EventMap>(event: T, handler: EventHandler<EventMap[T]>): void => {
    const eventHandlers = this.#handlers[event]
    if (eventHandlers) {
      this.#handlers[event] = eventHandlers.filter(
        existingHandler => existingHandler !== handler,
      )
    }
  }

  clear = (): void => {
    this.#handlers = {}
  }
}
