/* eslint-disable @typescript-eslint/no-explicit-any */
export type EventHandler<P extends any[] = any[]> = (...payloads: P) => void

export class EventBus<EventMap extends Record<string, any[]>> {
  #handlers: Record<any, any[]> = {}

  on = <T extends keyof EventMap, P extends EventMap[T]>(event: T, handler: EventHandler<P>): void => {
    if (!this.#handlers[event])
      this.#handlers[event] = []
    this.#handlers[event].push(handler)
  }

  once = <T extends keyof EventMap, P extends EventMap[T]>(event: T, handler: EventHandler<P>): void => {
    const onceHandler: EventHandler<P> = (...payloads: P) => {
      handler(...payloads)
      this.off(event, onceHandler)
    }
    this.on(event, onceHandler)
  }

  emit = <T extends keyof EventMap, P extends EventMap[T]>(event: T, ...payloads: P): void => {
    const eventHandlers = this.#handlers[event]
    if (eventHandlers)
      eventHandlers.forEach(handler => handler(...payloads))
  }

  off = <T extends keyof EventMap, P extends EventMap[T]>(event: T, handler: EventHandler<P>): void => {
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
