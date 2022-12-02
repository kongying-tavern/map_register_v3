<script lang="ts" setup>
import { RadioCardGroup } from '.'
import { useTypeList } from '@/hooks'

const props = defineProps<{
  modelValue?: number
  iconMap: Record<string, string>
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

const { typeList } = useTypeList()

const leafList = computed(() => typeList.value.reduce((seed, { typeId, isFinal, ...rest }) => {
  isFinal && seed.push({
    ...rest,
    isFinal,
    typeId: `${typeId}`,
  })
  return seed
}, [] as Record<string, any>[]))
</script>

<template>
  <RadioCardGroup v-model="internalBind" :item-list="leafList" data-key="typeId" item-key="typeId">
    <template #default="{ item }">
      <div class="h-full aspect-square rounded grid place-items-center bg-gray-800">
        <el-image
          :src="iconMap[item.iconTag ?? '']"
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
