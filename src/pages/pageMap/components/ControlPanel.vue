<script lang="ts" setup>
import { FilterArea, FilterItem, FilterStep, FilterType, MarkersTable } from '.'

const props = defineProps<{
  areaId?: number
  type?: number
  step?: string | number
  iconName?: string
  areaList: API.AreaVo[]
  iconMap: Record<string, string>
  itemList: API.ItemVo[]
  markerList: API.MarkerVo[]
  markerLoading?: boolean
  itemLoading?: boolean
}>()

const emits = defineEmits<{
  (e: 'update:areaId', v?: number): void
  (e: 'update:type', v?: number): void
  (e: 'update:iconName', v?: string): void
  (e: 'changeStep', v?: number): void
  (e: 'update:step', v: number): void
}>()

const bindAreaId = computed({
  get: () => props.areaId,
  set: v => emits('update:areaId', v),
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
</script>

<template>
  <div class="left-control-panel" v-bind="$attrs">
    <FilterStep
      v-model="bindStep"
      :step-names="steps"
      class="content"
    />

    <div class="content">
      <Transition :name="trName" mode="out-in" appear>
        <KeepAlive>
          <FilterArea
            v-if="(bindStep === 0)"
            v-model="bindAreaId"
            :area-list="areaList"
            :icon-map="iconMap"
            class="h-full"
            @change="next"
          />
          <FilterType
            v-else-if="(bindStep === 1)"
            v-model="bindType"
            :icon-map="iconMap"
            class="h-full"
            @change="next"
          />
          <div v-else-if="!bindType" class="h-full grid place-items-center text-white">
            <el-button link type="primary" @click="(bindStep -= 1)">
              请选择分类
            </el-button>
          </div>
          <FilterItem
            v-else-if="(bindStep === 2)"
            v-model="bindItemName"
            :item-list="itemList"
            :icon-map="iconMap"
            :loading="itemLoading"
            class="h-full"
          />
        </KeepAlive>
      </Transition>
    </div>

    <MarkersTable :marker-list="markerList" :loading="markerLoading" class="content" />
  </div>
</template>

<style lang="scss" scoped>
.left-control-panel {
  grid-template-rows: auto 15rem 1fr;
  width: 432px;
}

.content {
  border: 1px solid rgb(134, 128, 120);
  width: 100%;
  height: 100%;
  border-radius: 4px;
  background-color: rgba(94, 94, 94, 0.3);
  transition: all ease 150ms;
  overflow: hidden;

  &:hover {
    background-color: rgba(134, 128, 120, 0.3);
  }
}
</style>
