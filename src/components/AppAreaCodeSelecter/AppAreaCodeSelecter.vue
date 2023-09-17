<script lang="ts" setup>
import type { CascaderProps } from 'element-plus'
import db from '@/database'
import { useFetchHook } from '@/hooks'

const props = defineProps<{
  modelValue?: string
}>()

const emits = defineEmits<{
  'update:modelValue': [code: string]
}>()

// ==================== 地区信息 ====================
const { data: areaList, onFinish: onAreaFetched } = useFetchHook({
  immediate: true,
  initialValue: [],
  shallow: true,
  onRequest: () => db.area.toArray(),
})

/** 当没有传入 areaCode 时使用内部值 */
const internalAreaCode = ref<string>('')

const initFlag = ref(false)
const areaIds = ref<number[]>([])

const initAreaIds = () => {
  const childArea = areaList.value.find(area => area.code === props.modelValue ?? internalAreaCode.value)
  if (!childArea)
    return []
  const parentArea = areaList.value.find(area => area.id === childArea.parentId)
  if (!parentArea)
    return []
  initFlag.value = true
  areaIds.value = [parentArea.id!, childArea.id!]
}
watch(() => props.modelValue, initAreaIds)

const handleAreaIdsChange = () => {
  if (initFlag.value) {
    initFlag.value = false
    return
  }
  const [_, childId] = areaIds.value
  const childArea = areaList.value.find(area => area.id === childId)
  if (!childArea)
    return false
  if (props.modelValue === undefined)
    internalAreaCode.value = childArea.code!
  else
    emits('update:modelValue', childArea.code!)
}

onAreaFetched(initAreaIds)

const areaCascaderProps: CascaderProps = {
  lazy: true,
  label: 'name',
  value: 'id',
  leaf: 'isFinal',
  lazyLoad: (node, resolve) => {
    const { level } = node
    if (level === 0)
      return db.area.where('parentId').equals(-1).toArray().then(resolve)
    db.area.where('parentId').equals(node.value).toArray().then(resolve)
  },
}
</script>

<template>
  <el-cascader
    v-bind="$attrs"
    v-model="areaIds"
    :props="areaCascaderProps"
    placeholder="选择地区"
    @change="handleAreaIdsChange"
  />
</template>
