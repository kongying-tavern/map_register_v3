import Konva from 'konva'
import type { ShallowRef } from 'vue'
import { clamp } from 'lodash'
import { loadKonvaImage } from '../utils'
import type { AppImageCropperProps } from '../types'
import { getObjectFitSize } from '@/utils'

export interface ImageInfoHookOptions extends ToRefDestructure<Required<AppImageCropperProps>> {
  layer: ShallowRef<Konva.Layer | null>
  width: Ref<number>
  height: Ref<number>
  onCrop: (blob: Blob) => void
  onError: (err: Error) => void
}

export const useImage = (options: ImageInfoHookOptions) => {
  const {
    image,
    layer,
    width: cw,
    height: ch,
    maxZoom,
    minZoom,
    cropRatio,
    autoCrop,
    autoCropDebounce,
    autoCropOnImageLoaded,
    onCrop,
    onError,
  } = options

  const konvaImage = shallowRef<Konva.Image | null>(null)

  const immediateCrop = async () => {
    const stage = konvaImage.value?.getStage()
    if (!stage)
      return
    const blob = await stage.toBlob({
      mimeType: 'image/png',
      pixelRatio: cropRatio.value,
    }) as Blob
    onCrop(blob)
    return blob
  }

  const debounceCrop = useDebounceFn(immediateCrop, autoCropDebounce)

  const crop = () => {
    // TODO 适配器
    debounceCrop()
  }

  const minScale = computed(() => {
    if (!konvaImage.value)
      return 1
    const iw = konvaImage.value.width()
    const ih = konvaImage.value.height()
    const { radio } = getObjectFitSize('cover', cw.value, ch.value, iw, ih)
    return minZoom.value === undefined ? radio : Math.max(radio, minZoom.value)
  })

  const maxScale = computed(() => {
    if (!konvaImage.value || maxZoom.value === undefined)
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
    _image.on('dragend', () => autoCrop.value && crop())
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
      autoCrop.value && crop()
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
        autoCrop.value && crop()
      }
    })
  }

  const resetImagePosition = (_image: Konva.Image) => {
    const layer = _image.getLayer()
    if (!layer)
      return
    const { width: cw, height: ch } = layer.size()
    const { width, height } = _image.size()
    const scale = minScale.value
    _image
      .offset({ x: width / 2, y: height / 2 })
      .scale({ x: scale, y: scale })
      .position({ x: cw / 2, y: ch / 2 })
      .setDraggable(true)
  }

  watch(() => [cw.value, ch.value], () => {
    const _image = konvaImage.value
    if (!_image)
      return
    resetImagePosition(_image)
    autoCrop.value && crop()
  })

  const initImage = async () => {
    konvaImage.value?.remove()
    if (!image.value)
      return

    try {
      const _image = await loadKonvaImage(image.value).catch(() => null)
      if (!_image)
        throw new Error('无法加载文件')

      konvaImage.value = _image

      if (!layer.value)
        throw new Error('无法获取图层实例')

      layer.value.add(_image)

      resetImagePosition(_image)

      autoCropOnImageLoaded.value && crop()
      attachDragController(_image)
      attachZoomController(_image)
      attachRotateController(_image)
    }
    catch (err) {
      onError(err instanceof Error
        ? err
        : new Error(err instanceof Event ? 'internal error' : `${err}`),
      )
    }
  }

  const startWatchUrl = () => watch(image, initImage, { immediate: true })

  return {
    minScale,
    maxScale,

    crop,
    startWatchUrl,
  }
}
