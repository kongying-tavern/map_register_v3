<script setup lang="ts">
const props = defineProps<{
  config: API.ExtraConfig
}>()

const modelValue = defineModel<API.MarkerExtra['underground'] | undefined>({
  required: true,
})

const isUnderground = computed({
  get: () => Boolean(toValue(modelValue)?.is_underground),
  set: (bool) => {
    if (!bool) {
      modelValue.value = null
      return true
    }
    modelValue.value = {
      is_underground: true,
      region_levels: [],
    }
  },
})

const regionLevels = computed({
  get: () => {
    const value = toValue(modelValue)
    if (!value?.region_levels?.length)
      return [] as string[][]

    const { levels = [] } = props.config.underground ?? {}
    if (!levels.length)
      return [] as string[][]

    const regionCodeMap = levels.reduce((map, parent) => {
      parent.children.forEach(({ value }) => {
        map.set(value, parent)
      })
      return map
    }, new Map<string, (typeof levels)[number]>())

    return value.region_levels.reduce((seed, regionCode) => {
      const parent = regionCodeMap.get(regionCode)
      if (parent)
        seed.push([parent.value, regionCode])
      return seed
    }, [] as string[][])
  },
  set: (levelList) => {
    if (!modelValue.value)
      return false
    modelValue.value.region_levels = levelList.reduce((seed, [_, regionCode]) => {
      regionCode !== undefined && seed.push(regionCode)
      return seed
    }, [] as string[])
  },
})
</script>

<template>
  <div class="mb-4">
    <div class="mb-1">
      分层层级
    </div>

    <div class="flex gap-2 overflow-hidden">
      <el-switch
        v-model="isUnderground"
        :active-text="config.underground!.textActive ?? '非地面'"
        :inactive-text="config.underground!.textInactive ?? '地面'"
        inline-prompt
        class="flex-shrink-0"
      />
      <el-cascader
        v-if="config.underground!.useDetail && modelValue?.is_underground"
        v-model="regionLevels"
        :options="config.underground!.levels"
        :props="{
          multiple: true,
        }"
        :show-all-levels="false"
        class="flex-1"
      />
    </div>
  </div>
</template>
