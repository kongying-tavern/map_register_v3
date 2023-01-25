<script lang="ts" setup>
import { FullScreen, Minus } from '@element-plus/icons-vue'
import { FilterArea, FilterItem, FilterStep, FilterType, MarkersTable } from '.'

const props = defineProps<{
  areaCode?: string
  type?: number
  step?: string | number
  iconName?: string
  markerLoading?: boolean
  itemLoading?: boolean
  /** 显示审核中点位 */
  showPunctuate: boolean
  /** 显示已审核点位 */
  showMarker: boolean
  /** 仅显示地下 */
  onlyUnderground: boolean
}>()

const emits = defineEmits<{
  (e: 'update:areaCode', v?: string): void
  (e: 'update:type', v?: number): void
  (e: 'update:iconName', v?: string): void
  (e: 'update:showPunctuate', v?: boolean): void
  (e: 'update:showMarker', v?: boolean): void
  (e: 'update:onlyUnderground', v?: boolean): void
  (e: 'changeStep', v?: number): void
  (e: 'update:step', v: number): void
  (e: 'flytoId', v: number): void
}>()

const bindAreaCode = computed({
  get: () => props.areaCode,
  set: v => emits('update:areaCode', v),
})

const bindType = computed({
  get: () => props.type,
  set: v => emits('update:type', v),
})

const bindStep = computed({
  get: () => Number(props.step) || 0,
  set: v => emits('update:step', v),
})

const bindItemName = computed({
  get: () => props.iconName,
  set: v => emits('update:iconName', v),
})

const bindShowPunctuate = computed({
  get: () => props.showPunctuate,
  set: v => emits('update:showPunctuate', v),
})

/** 显示审核中点位切换按钮背景颜色 */
const punctuateBtnColor = computed(() => {
  return props.showPunctuate ? 'var(--el-color-info)' : 'rgba(94, 94, 94, 0.3)'
})

const bindShowMarker = computed({
  get: () => props.showMarker,
  set: v => emits('update:showMarker', v),
})

/** 显示已审核点位切换按钮背景颜色 */
const showMarkerBtnColor = computed(() => {
  return props.showMarker ? 'var(--el-color-info)' : 'rgba(94, 94, 94, 0.3)'
})

const bindOnlyUnderground = computed({
  get: () => props.onlyUnderground,
  set: v => emits('update:onlyUnderground', v),
})

/** 仅显示地下点位切换按钮背景颜色 */
const onlyUndergroundBtnColor = computed(() => {
  return props.onlyUnderground ? 'var(--el-color-info)' : 'rgba(94, 94, 94, 0.3)'
})

const steps = ['选择地区', '选择分类', '选择物品']

const trName = ref('slide-x-r')

watch(bindStep, (newStep, oldStep) => {
  trName.value = newStep > oldStep ? 'slide-x-r' : 'slide-x-l'
})

const autoNextStep = ref(false)

const next = (v?: string | number) => {
  if (v === undefined || !autoNextStep.value)
    return
  bindStep.value < steps.length - 1 && (bindStep.value += 1)
}

const minus = ref(false)
</script>

<template>
  <div class="left-control-panel" :class="{ minus }" v-bind="$attrs">
    <div class="w-full flex gap-2">
      <div
        class="content grid place-items-center aspect-square cursor-pointer hover:brightness-125"
        :style="{ width: 'auto' }"
        :title="minus ? '展开' : '折叠'"
        @click="(minus = !minus)"
      >
        <el-icon>
          <Minus v-if="!minus" />
          <FullScreen v-else />
        </el-icon>
      </div>
      <FilterStep
        v-model="bindStep"
        :step-names="steps"
        class="content flex-1"
      />
      <div class="content px-2 flex justify-center items-center gap-1" title="满足条件时自动进入下一个选择器">
        <div class="text-xs leading-none">
          auto
          <br>
          next
        </div>
        <el-switch v-model="autoNextStep" />
      </div>
    </div>

    <div class="content">
      <Transition :name="trName" mode="out-in" appear>
        <KeepAlive>
          <FilterArea v-if="(bindStep === 0)" v-model="bindAreaCode" class="h-full" @change="next" />

          <div v-else-if="bindAreaCode === undefined" class="h-full grid place-items-center text-white">
            <el-button link type="primary" @click="(bindStep = 0)">
              请选择地区
            </el-button>
          </div>

          <FilterType v-else-if="(bindStep === 1)" v-model="bindType" class="h-full" @change="next" />

          <div v-else-if="!bindType" class="h-full grid place-items-center text-white">
            <el-button link type="primary" @click="(bindStep = 1)">
              请选择分类
            </el-button>
          </div>

          <FilterItem v-else-if="(bindStep === 2)" v-model="bindItemName" :loading="itemLoading" class="h-full" />
        </KeepAlive>
      </Transition>
    </div>

    <div class="w-full flex gap-2">
      <el-button-group>
        <el-tooltip
          content="显示审核中点位"
          placement="top"
        >
          <el-button
            size="large"
            v-bind="$attrs"
            :style="{ 'background-color': punctuateBtnColor, 'border-color': punctuateBtnColor }"
            @click="bindShowPunctuate = !bindShowPunctuate"
          >
            <el-icon color="#FFFFFF" size="20">
              <EditPen />
            </el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip
          content="显示审核通过点位"
          placement="top"
        >
          <el-button
            size="large"
            v-bind="$attrs"
            :style="{ 'background-color': showMarkerBtnColor, 'border-color': showMarkerBtnColor }"
            @click="bindShowMarker = !bindShowMarker"
          >
            <el-icon color="#FFFFFF" size="20">
              <Location />
            </el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip
          content="仅显示地下点位"
          placement="top"
        >
          <el-button
            size="large"
            v-bind="$attrs"
            :style="{ 'background-color': onlyUndergroundBtnColor, 'border-color': onlyUndergroundBtnColor }"
            @click="bindOnlyUnderground = !bindOnlyUnderground"
          >
            <svg t="1673867585560" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="879" width="20" height="20">
              <path d="M512.219429 579.291429c17.133714 0 33.846857-5.577143 54.418285-17.572572l335.579429-194.56c34.285714-20.150857 48-36.022857 48-59.593143 0-23.131429-13.714286-39.003429-48-59.136L566.637714 53.869714c-20.571429-12.013714-37.284571-17.590857-54.418285-17.590857-17.572571 0-33.865143 5.577143-54.436572 17.572572L122.221714 248.411429c-34.285714 20.150857-48 36.022857-48 59.154285 0 23.588571 13.714286 39.442286 48 59.574857l335.561143 194.56c20.571429 12.013714 36.864 17.590857 54.436572 17.590858z m0-74.569143c-6.016 0-12.013714-2.157714-18.870858-6.016L166.784 311.862857c-1.718857-0.859429-2.998857-2.139429-2.998857-4.297143 0-1.700571 1.28-2.998857 2.998857-3.84l326.582857-186.88c6.838857-3.84 12.836571-5.979429 18.834286-5.979428 6.016 0 12.013714 2.139429 18.870857 5.997714l326.144 186.843429c2.139429 0.859429 3.437714 2.157714 3.437714 3.858285 0 2.139429-1.298286 3.437714-3.437714 4.297143L531.072 498.706286c-6.857143 3.858286-12.854857 6.016-18.852571 6.016z m0 285.842285c15.414857 0 28.708571-7.277714 46.701714-17.993142L927.085714 555.282286c16.274286-9.856 23.149714-23.990857 23.149715-37.284572 0-17.554286-12.854857-32.146286-24.429715-37.705143L528.493714 709.577143c-5.997714 3.419429-11.574857 5.997714-16.274285 5.997714-4.717714 0-10.294857-2.56-16.292572-5.997714L98.633143 480.274286c-11.995429 5.577143-24.850286 20.150857-24.850286 37.723428 0 13.293714 7.716571 27.867429 23.588572 37.302857L465.481143 772.571429c17.993143 10.715429 30.848 17.993143 46.72 17.993142z m0 197.156572c15.414857 0 28.708571-7.296 46.701714-18.011429L927.085714 752.420571c15.853714-8.996571 23.149714-23.990857 23.149715-37.284571 0-17.554286-12.854857-31.707429-24.429715-37.705143L528.493714 907.136c-5.997714 3.437714-11.574857 5.997714-16.274285 5.997714-4.717714 0-10.294857-2.56-16.292572-5.997714L98.633143 677.430857c-11.995429 5.997714-24.850286 20.132571-24.850286 37.705143 0 13.293714 7.716571 28.288 23.588572 37.302857L465.481143 969.691429c17.993143 10.715429 30.848 18.011429 46.72 18.011428z" p-id="880" fill="#ffffff" />
            </svg>
          </el-button>
        </el-tooltip>
      </el-button-group>
    </div>

    <MarkersTable :loading="markerLoading" class="content" />
  </div>
</template>

<style lang="scss" scoped>
.left-control-panel {
  --clip-rest: calc(100% - 31px - 1rem);
  --content-radius: 4px;

  grid-template-rows: auto 15rem auto 1fr;
  width: 432px;
  clip-path: inset(0 0);
  transform: translate(0, 0);
  transition: var(--el-transition-all);

  &.minus {
    --content-radius: 8px;
    clip-path: inset(8px var(--clip-rest) var(--clip-rest) 8px round 8px);
    transform: translate(-8px, -8px);
  }
}

.content {
  color: white;
  border: 1px solid rgb(134, 128, 120);
  height: 100%;
  border-radius: var(--content-radius);
  background-color: rgba(94, 94, 94, 0.3);
  transition: var(--el-transition-all);
  overflow: hidden;
}

.el-button--large{
  width: 40px
}
</style>
