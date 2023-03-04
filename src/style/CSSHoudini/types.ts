/** 绘制上下文 */
export declare class PaintRenderingContext2D extends CanvasRenderingContext2D {}

/** 画布尺寸 */
export declare class PaintSize {
  height: number
  width: number
}

/** css 样式属性 */
export declare class StylePropertyMapReadOnly extends Map {}

/** 绘制类 */
export abstract class Painter {
  static inputProperties?: string[]

  abstract paint(ctx: PaintRenderingContext2D, { width, height }: PaintSize, properties: StylePropertyMapReadOnly): void
}
