export {}

/**
 * 注册函数
 * @link https://developer.mozilla.org/en-US/docs/Web/API/PaintWorklet/registerPaint
 */
declare global {
  const registerPaint: (name: string, classRef: typeof Painter) => void
}
