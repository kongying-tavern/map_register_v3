<script lang="ts" setup>
import type { CascaderProps } from 'element-plus'
import db from '@/database'

const props = defineProps<{
  /** 子地区 code，必须为 `A:${string}:${string}` 格式 */
  modelValue?: string
}>()

const emits = defineEmits<{
  'update:modelValue': [code: string]
}>()

const internalAreaCode = ref<string>('')

const covertCodeToCodes = (childCode: string) => {
  const name = childCode.split(':')[1]
  return [`C:${name}`, childCode]
}

const areaCodeList = computed({
  get: () => {
    if (props.modelValue === undefined)
      return covertCodeToCodes(internalAreaCode.value)
    if (!props.modelValue)
      return []
    return covertCodeToCodes(props.modelValue)
  },
  set: ([_, childAreaCode]) => {
    if (props.modelValue === undefined) {
      internalAreaCode.value = childAreaCode
      return
    }
    emits('update:modelValue', childAreaCode)
  },
})

const areaCascaderProps: CascaderProps = {
  lazy: true,
  label: 'name',
  value: 'code',
  leaf: 'isFinal',
  lazyLoad: (node, resolve) => {
    const { level } = node
    if (level === 0)
      return db.area.where('parentId').equals(-1).toArray().then(resolve)
    const code = node.value as string
    const parentAreaCodeTag = code.split(':')[1]
    db.area.where('code').startsWith(`A:${parentAreaCodeTag}`).toArray().then(resolve)
  },
}
</script>

<template>
  <el-cascader
    v-bind="$attrs"
    v-model="areaCodeList"
    :props="areaCascaderProps"
    placeholder="选择地区"
  />
</template>
