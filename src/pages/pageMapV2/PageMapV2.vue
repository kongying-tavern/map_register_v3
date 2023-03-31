<script lang="ts" setup>
import { COORDINATE_SYSTEM, Deck, OrthographicView, TRANSITION_EVENTS } from '@deck.gl/core/typed'
import type { PickingInfo } from '@deck.gl/core/typed'
import type { TransitionProps } from '@deck.gl/core/typed/controllers/transition-manager'
import type { NonGeoBoundingBox } from '@deck.gl/geo-layers/typed'
import { TileLayer } from '@deck.gl/geo-layers/typed'
import type { Tile2DHeader } from '@deck.gl/geo-layers/typed/tileset-2d'
import { BitmapLayer, LineLayer, ScatterplotLayer } from '@deck.gl/layers/typed'
import { load } from '@loaders.gl/core'
import db from '@/database'
import { Logger } from '@/utils'

const logger = new Logger('[MapV2]')

const canvasRef = ref<HTMLCanvasElement | null>(null)

const layerSize = {
  w: 17408,
  h: 16384,
}
const layerOffset = {
  x: 5120,
  y: 0,
}
const layerOrigin = {
  x: 3568,
  y: 6288,
}
const xmin = -layerOffset.x
const ymin = -layerOffset.y
const xmax = layerSize.w - layerOffset.x
const ymax = layerSize.h - layerOffset.y

interface GenshinViewState extends TransitionProps {
  target: [number, number, number]
  zoom: number
  minZoom: number
  maxZoom: number
}

const viewState = reactive({
  zoom: -4,
  minZoom: -4,
  maxZoom: 2,
  target: [layerOrigin.x, layerOrigin.y, 0],
})

interface BitmapHeader {
  pixel: [number, number]
  size: { width: number; height: number }
  uv: [number, number]
}

const getTooltip = (info: PickingInfo & { tile?: Tile2DHeader; bitmap?: BitmapHeader }) => {
  if (!info.coordinate)
    return null
  const [x, y] = info.coordinate
  return `${Math.floor(x - layerOrigin.x)}, ${Math.floor(y - layerOrigin.y)}`
}

interface LineProps {
  start: [number, number]
  end: [number, number]
}

const layer = new TileLayer({
  id: 'layer-twt34',
  // pickable: true,
  // autoHighlight: true,
  // highlightColor: [60, 60, 60, 100],
  tileSize: 256,
  minZoom: -3,
  maxZoom: 0,
  coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
  coordinateOrigin: [layerOffset.x, layerOffset.y, 0],
  maxRequests: 1,
  extent: [xmin, ymax, xmax, ymin],
  getTileData: async ({ index, signal }) => {
    if (signal?.aborted)
      return null
    const { x, y, z } = index
    return load(`https://assets.yuanshen.site/tiles_twt34/${z + 13}/${x}_${y}.png`)
  },
  renderSubLayers: (renderProps) => {
    const { left, bottom, right, top } = renderProps.tile.bbox as NonGeoBoundingBox
    return new BitmapLayer(renderProps, {
      // 通过自定义 getTileData 函数获取图片，不需要 data 字段，必须明确指定为空
      data: undefined,
      image: renderProps.data,
      bounds: [left, bottom, right, top],
    })
  },
})

const lines = new LineLayer<LineProps>({
  id: 'border',
  coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
  coordinateOrigin: [layerOffset.x, layerOffset.y, 0],
  data: [
    { start: [xmin, ymin], end: [xmax, ymin] },
    { start: [xmax, ymin], end: [xmax, ymax] },
    { start: [xmax, ymax], end: [xmin, ymax] },
    { start: [xmin, ymax], end: [xmin, ymin] },
  ],
  getWidth: 2,
  getColor: () => [255, 0, 0, 255],
  getSourcePosition: d => d.start,
  getTargetPosition: d => d.end,
})

const view = new OrthographicView({
  id: 'genshin-view',
})

const map = shallowRef<Deck | null>(null)

const total = ref(0)
const count = ref(0)
const renderMarkers = async () => {
  if (!map.value)
    return

  const markerList = await db.marker.toArray()
  const start = new Date().getTime()
  total.value = markerList.length

  const markers = new ScatterplotLayer<API.MarkerVo>({
    id: 'markers',
    pickable: true,
    autoHighlight: true,
    highlightColor: [0, 0, 0, 20],
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    coordinateOrigin: [layerOffset.x, layerOffset.y, 0],
    data: markerList,
    // 描边样式
    getLineColor: [0, 0, 0, 60],
    getLineWidth: 2,
    lineWidthMinPixels: 0,
    lineWidthMaxPixels: 2,
    lineWidthScale: 1,
    stroked: true,
    // 点位样式
    radiusScale: 1,
    radiusMinPixels: 2,
    radiusMaxPixels: 16,
    getRadius: 16,
    getPosition: (d) => {
      const pos = d.position?.split(',').map(Number) as [number, number]
      const x = pos[0] + layerOrigin.x
      const y = pos[1] + layerOrigin.y
      return [x, y, 0]
    },
    getFillColor: () => [32, 192, 128, 128],
    onClick: (pickingInfo, event) => {
      logger.info('[click]', { pickingInfo, event })
    },
  })

  map.value.setProps({
    layers: [layer, lines, markers],
  })

  const end = new Date().getTime()
  count.value = end - start
}

const initMap = async () => {
  if (!canvasRef.value)
    return

  const deck = new Deck({
    canvas: canvasRef.value,
    width: '100%',
    height: '100%',
    initialViewState: viewState,
    views: view,
    controller: {
      doubleClickZoom: false,
      scrollZoom: {
        speed: 0.01,
        smooth: true,
      },
    },
    layers: [],
    getTooltip,
    getCursor: state => state.isDragging ? 'grabbing' : state.isHovering ? 'pointer' : 'crosshair',
    onViewStateChange: ({ viewState: state, oldViewState: oldState }) => {
      const { zoom } = state as GenshinViewState
      const { zoom: oldZoom } = oldState as GenshinViewState
      const newState: GenshinViewState = {
        ...(state as GenshinViewState),
        transitionDuration: zoom === oldZoom ? 0 : 200,
        transitionInterruption: TRANSITION_EVENTS.BREAK,
        transitionEasing: (t: number) => Math.sin(t * Math.PI / 2),
      }
      return newState
    },
  })
  map.value = deck

  renderMarkers()
}

onMounted(initMap)
</script>

<template>
  <div class="w-full h-full relative">
    <canvas ref="canvasRef" class="w-full h-full bg-black" />

    <div class="absolute left-2 bottom-2 flex flex-col gap-2">
      <router-link to="/map">
        <el-button>V1地图</el-button>
      </router-link>

      <el-alert :closable="false">
        渲染点位 {{ total }} 个，耗时 {{ count }} ms。
      </el-alert>
    </div>
  </div>
</template>
