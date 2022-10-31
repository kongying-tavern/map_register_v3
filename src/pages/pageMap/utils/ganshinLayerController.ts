export class GenshinLayerController {
  constructor(private instance: HTMLElement) {
    this.initBaseLayersRadios()
    this.initOverlaysChecboxs()
  }

  /** 控制面板的互斥图层选项 */
  readonly baseLayersRadios: Record<string, HTMLInputElement> = {}
  readonly baseLayersOptions: { label: string; value: HTMLInputElement }[] = []

  /** 控制面板的可覆盖图层选项 */
  readonly overlaysChecboxs: Record<string, HTMLInputElement> = {}
  readonly overlaysOptions: { label: string; value: HTMLInputElement }[] = []

  /** 初始化互斥图层选项 */
  private initBaseLayersRadios = () => {
    const radios = this.instance.querySelectorAll<HTMLInputElement>('input[type=radio]') ?? []
    radios.forEach((radio) => {
      const key = `${radio.parentElement?.children.item(1)?.innerHTML}`.trim()
      this.baseLayersRadios[key] = radio
      this.baseLayersOptions.push({ label: key, value: radio })
    })
  }

  /** 初始化可覆盖图层选项 */
  private initOverlaysChecboxs = () => {
    const checkboxes = this.instance.querySelectorAll<HTMLInputElement>('input[type=checkbox]') ?? []
    checkboxes.forEach((checkbox) => {
      const key = `${checkbox.parentElement?.children.item(1)?.innerHTML}`.trim()
      this.overlaysChecboxs[key] = checkbox
      this.overlaysOptions.push({ label: key, value: checkbox })
    })
  }

  /** 切换互斥图层 */
  switchBaseLayer = (key: string) => {
    if (!Reflect.has(this.baseLayersRadios, key)) {
      console.log('没有对应的图层')
      return
    }
    this.baseLayersRadios[key].click()
  }

  /** 切换可覆盖图层状态 */
  switchOverlay = (key: string) => {
    if (!Reflect.has(this.overlaysChecboxs, key))
      return
    this.overlaysChecboxs[key].click()
  }
}
