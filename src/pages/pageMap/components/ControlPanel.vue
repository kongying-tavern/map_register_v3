<script lang="ts" setup>
import { AreaPanel, ItemPanel, ItemStepFilter, TypePanel } from '.'

const props = defineProps<{
  areaId?: number
  selectedType?: number
  iconName?: string
  areaList: API.AreaVo[]
  iconMap: Record<string, string>
  itemList: API.ItemVo[]
  itemLoading?: boolean
}>()

const emits = defineEmits<{
  (e: 'update:areaId', v?: number): void
  (e: 'update:type', v?: number): void
  (e: 'update:iconName', v?: string): void
  (e: 'changeStep', v?: number): void
}>()

const bindAreaId = computed({
  get: () => props.areaId,
  set: v => emits('update:areaId', v),
})

const bindType = computed({
  get: () => props.selectedType,
  set: v => emits('update:type', v),
})

const bindItemName = computed({
  get: () => props.iconName,
  set: v => emits('update:iconName', v),
})

const steps = ['选择地区', '选择分类', '选择物品']
const step = ref(0)

const next = (v?: string | number) => {
  if (v === undefined)
    return
  step.value < steps.length - 1 && (step.value += 1)
}
</script>

<template>
  <div v-bind="$attrs">
    <ItemStepFilter
      v-model="step"
      :step-names="['选择地区', '选择分类', '选择物品']"
      class="content"
    />

    <div class="filter-content content overflow-hidden">
      <KeepAlive>
        <AreaPanel
          v-if="(step === 0)"
          v-model="bindAreaId"
          :area-list="areaList"
          :icon-map="iconMap"
          class="h-full"
          @change="next"
        />
        <TypePanel
          v-else-if="(step === 1)"
          v-model="bindType"
          :icon-map="iconMap"
          class="h-full"
          @change="next"
        />
        <ItemPanel
          v-else-if="(step === 2)"
          v-model="bindItemName"
          :item-list="itemList"
          :icon-map="iconMap"
          :loading="itemLoading"
          class="h-full"
        />
      </KeepAlive>
    </div>

    <div class="content text-white">
      点位列表
    </div>
  </div>
</template>

<style lang="scss" scoped>
.content {
  background-color: rgba(50, 57, 71, 0.7);
  width: 100%;
  height: 100%;
  border-radius: 4px;
}

.filter-content {
  width: 400px;
}
</style>
