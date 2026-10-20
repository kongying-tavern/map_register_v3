import { afterEach, vi } from 'vitest'

// jsdom 未实现 ResizeObserver，部分组件（图表 / 可拖拽窗口等）在挂载时会直接引用它
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class ResizeObserver {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
  } as unknown as typeof globalThis.ResizeObserver
}

// jsdom 未实现 matchMedia，响应式布局相关逻辑依赖它
if (!globalThis.matchMedia) {
  globalThis.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof globalThis.matchMedia
}

// 每个用例结束后清理 DOM，避免残留节点影响后续断言
afterEach(() => {
  document.body.innerHTML = ''
})
