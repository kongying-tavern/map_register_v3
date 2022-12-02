<script lang="ts" setup>
import { RadioCardGroup } from '.'

const props = defineProps<{
  modelValue?: number
  iconMap: Record<string, string>
  areaList: API.AreaVo[]
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', v?: number): void
  (e: 'change', v?: number): void
}>()

const internalBind = computed({
  get: () => `${props.modelValue}`,
  set: (v) => {
    const formatValue = Number(v)
    emits('update:modelValue', formatValue || undefined)
    emits('change', formatValue || undefined)
  },
})

const leafList = computed(() => props.areaList.reduce((seed, { areaId, parentId, ...rest }) => {
  parentId !== -1 && seed.push({
    ...rest,
    areaId: `${areaId}`,
  })
  return seed
}, [] as Record<string, any>[]))
</script>

<template>
  <RadioCardGroup v-model="internalBind" :item-list="leafList" data-key="areaId" item-key="areaId">
    <template #default="{ item }">
      <div class="h-full aspect-square rounded grid place-items-center bg-gray-800">
        <el-image
          :src="iconMap[item.iconTag]"
          :alt="item.name"
          :title="item.name"
          lazy
          fit="contain"
          decoding="async"
          referrerpolicy="no-referrer"
          class="w-4/5 h-4/5 bg-transparent"
          style="--el-fill-color-light: transparent"
        >
          <template #error>
            <img class="w-full h-full object-contain" src="https://assets.yuanshen.site/icons/-1.png">
          </template>
        </el-image>
      </div>

      <div class="flex-1 align-middle whitespace-nowrap overflow-hidden text-ellipsis leading-7">
        {{ item.name }}
      </div>
    </template>
  </RadioCardGroup>
</template>
