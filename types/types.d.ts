declare module 'bz2' {
  /**
   * 解压 bz2 文件
   * @param bytes 需要解压的文件
   * @param checkCRC 是否进行 CRC 校验
   */
  export function decompress(bytes: Uint8Array, checkCRC?: boolean): Uint8Array
}

/** 绘制上下文 */
declare class PaintRenderingContext2D extends CanvasRenderingContext2D {}

/** 画布尺寸 */
declare class PaintSize {
  height: number
  width: number
}

/** css 样式属性 */
declare class StylePropertyMapReadOnly extends Map {}

/** 绘制类 */
declare class Painter {
  static inputProperties?: string[]

  paint(ctx: PaintRenderingContext2D, { width, height }: PaintSize, properties: StylePropertyMapReadOnly): void
}
