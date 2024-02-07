/** 该文件用于存放 GensinMap 的视口过渡函数 */
export class TRANSITION {
  static readonly EASE_OUT = (t: number) => Math.sin(t * Math.PI / 2)

  static readonly LINEAR = (t: number) => t
}
