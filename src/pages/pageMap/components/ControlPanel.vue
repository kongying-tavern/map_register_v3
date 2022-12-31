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
}>()

const emits = defineEmits<{
  (e: 'update:areaCode', v?: string): void
  (e: 'update:type', v?: number): void
  (e: 'update:iconName', v?: string): void
  (e: 'changeStep', v?: number): void
  (e: 'update:step', v: number): void
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

const steps = ['选择地区', '选择分类', '选择物品']

const trName = ref('slide-x-r')

watch(bindStep, (newStep, oldStep) => {
  trName.value = newStep > oldStep ? 'slide-x-r' : 'slide-x-l'
})

const next = (v?: string | number) => {
  if (v === undefined)
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
    </div>

    <div class="content">
      <Transition :name="trName" mode="out-in" appear>
        <KeepAlive>
          <FilterArea v-if="(bindStep === 0)" v-model="bindAreaCode" class="h-full" @change="next" />

          <FilterType v-else-if="(bindStep === 1)" v-model="bindType" class="h-full" @change="next" />

          <div v-else-if="!bindType" class="h-full grid place-items-center text-white">
            <el-button link type="primary" @click="(bindStep -= 1)">
              请选择分类
            </el-button>
          </div>

          <FilterItem v-else-if="(bindStep === 2)" v-model="bindItemName" :loading="itemLoading" class="h-full" />
        </KeepAlive>
      </Transition>
    </div>

    <MarkersTable :loading="markerLoading" class="content" />
  </div>
</template>

<style lang="scss" scoped>
.left-control-panel {
  --clip-rest: calc(100% - 31px - 1rem);
  --content-radius: 4px;

  grid-template-rows: auto 15rem 1fr;
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
  width: 100%;
  height: 100%;
  border-radius: var(--content-radius);
  background-color: rgba(94, 94, 94, 0.3);
  transition: var(--el-transition-all);
  overflow: hidden;
}
</style>
