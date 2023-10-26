import Konva from 'konva'
import type { ShallowRef } from 'vue'
import { ElMessage } from 'element-plus'
import { clamp } from 'lodash'
import { loadKonvaImage } from '../utils'
import { getObjectFitSize } from '@/utils'

export interface ImageInfoHookOptions {
  layer: ShallowRef<Konva.Layer | null>
  width: Ref<number>
  height: Ref<number>
  maxZoom: ComputedRef<number | undefined>
  minZoom: ComputedRef<number | undefined>
}

export const useImage = (url: Ref<string | undefined>, options: ImageInfoHookOptions) => {
  const { layer, width: cw, height: ch, maxZoom, minZoom } = options

  const image = shallowRef<Konva.Image | null>(null)

  const minScale = computed(() => {
    if (!image.value)
      return 1
    const iw = image.value.width()
    const ih = image.value.height()
    const { radio } = getObjectFitSize('cover', cw.value, ch.value, iw, ih)
    return minZoom.value === undefined ? radio : Math.max(radio, minZoom.value)
  })

  const maxScale = computed(() => {
    if (!image.value || maxZoom.value === undefined)
      return 1
    return Math.max(minScale.value, 2 ** maxZoom.value)
  })

  const getBouondingPosition = (_image: Konva.Image, pos: { x: number; y: number }) => {
    const _stage = _image.getStage()
    if (!_stage)
      return pos
    const { width: cw, height: ch } = _stage.size()
    const { width: rectW, height: rectH } = _image.getClientRect()
    return {
      x: rectW < cw ? cw / 2 : clamp(pos.x, -0.5 * rectW + cw, 0.5 * rectW),
      y: rectH < ch ? ch / 2 : clamp(pos.y, -0.5 * rectH + ch, 0.5 * rectH),
    }
  }

  const attachDragController = (_image: Konva.Image) => {
    _image.dragBoundFunc(pos => getBouondingPosition(_image, pos))
  }

  const attachZoomController = (_image: Konva.Image) => {
    const _stage = _image.getStage()
    if (!_stage)
      return
    _stage.on('wheel', (ev) => {
      const currentScale = _image.scaleX()
      const newScale = clamp(currentScale * (1 - ev.evt.deltaY / 1000), minScale.value, maxScale.value)

      const { width: cw, height: ch } = _stage.size()
      const { width: rectW, height: rectH, x: imgX, y: imgY } = _image.getClientRect()

      const center = {
        x: cw / 2,
        y: ch / 2,
      }

      // 计算中心点坐标到图片的相对距离
      const relative = {
        x: (center.x - imgX) / rectW,
        y: (center.y - imgY) / rectH,
      }

      // 计算缩放后尺寸
      const scaleSize = {
        w: newScale * (rectW / currentScale),
        h: newScale * (rectH / currentScale),
      }

      // 计算缩放后中心点位置
      const position = {
        x: center.x - scaleSize.w * relative.x + (scaleSize.w / 2),
        y: center.y - scaleSize.h * relative.y + (scaleSize.h / 2),
      }

      _image.scale({
        x: newScale,
        y: newScale,
      }).position(getBouondingPosition(_image, position))
    })
  }

  const attachRotateController = (_image: Konva.Image) => {
    const _stage = _image.getStage()
    if (!_stage)
      return
    let tween: Konva.Tween | null = null
    _image.on('click', () => {
      if (tween)
        return
      const { width: cw, height: ch } = _stage.size()
      const ro = _image.rotation() + 90
      tween = new Konva.Tween({
        node: _image,
        x: cw / 2,
        y: ch / 2,
        scaleX: minScale.value,
        scaleY: minScale.value,
        rotation: Math.trunc(ro / 90) * 90,
        duration: 0.15,
        easing: Konva.Easings.EaseOut,
      }).play()
      tween.onFinish = () => {
        tween?.destroy()
        tween = null
      }
    })
  }

  const initImage = async () => {
    if (image.value)
      image.value.remove()
    if (!url.value)
      return

    try {
      const _image = await loadKonvaImage(url.value)
      image.value = _image

      if (!layer.value)
        throw new Error('无法获取图层实例')

      layer.value.add(_image)

      const { width: cw, height: ch } = layer.value.size()
      const { width, height } = _image.size()
      const scale = minScale.value
      _image
        .offset({ x: width / 2, y: height / 2 })
        .scale({ x: scale, y: scale })
        .position({ x: cw / 2, y: ch / 2 })
        .setDraggable(true)
      attachDragController(_image)
      attachZoomController(_image)
      attachRotateController(_image)
    }
    catch (err) {
      ElMessage.error({
        message: `初始化图片失败，原因为：${err instanceof Error ? err.message : err}`,
        offset: 48,
      })
    }
  }

  const startWatchUrl = () => watch(url, initImage, { immediate: true })

  return {
    minScale,
    maxScale,

    startWatchUrl,
  }
}
