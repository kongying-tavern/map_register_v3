<script lang="ts" setup>
import type Node from 'element-plus/es/components/tree/src/model/node'
import { useFetchHook } from '@/hooks'
import Api from '@/api/api'

type QueryForm = Omit<Required<API.TagSearchVo>, 'current' | 'size'>

const props = defineProps<{
  modelValue: QueryForm
}>()

const emits = defineEmits<{
  'update:modelValue': [QueryForm]
}>()

const tagList = computed({
  get: () => props.modelValue.tagList.join(''),
  set: v => emits('update:modelValue', { ...props.modelValue, tagList: !v ? [] : [v] }),
})

const tagType = computed({
  get: () => props.modelValue.typeIdList[0],
  set: v => emits('update:modelValue', { ...props.modelValue, typeIdList: !v ? [] : [v] }),
})

const { refresh, onSuccess } = useFetchHook({
  onRequest: (id: number) => Api.tagType.listTagType({
    current: 1,
    size: 10,
    typeIdList: [id],
  }),
})

const cachedIconTypeList = ref<API.IconTypeVo[]>([])

onSuccess(({ data: { record = [] } = {} }) => {
  cachedIconTypeList.value = record
})

const lazyLoadNode = (node: Node, resolve: (data: API.TagVo[]) => void) => {
  refresh(node.level === 0 ? -1 : node.id).then(() => resolve(cachedIconTypeList.value))
}

const tagTypeSelectProps = {
  label: 'name',
  isLeaf: 'isFinal',
  value: 'id',
}
</script>

<template>
  <el-form>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8">
      <el-form-item label="图标 Tag">
        <el-input v-model="tagList" placeholder="请输入图标标签" clearable />
      </el-form-item>

      <el-form-item label="图标类型">
        <el-tree-select
          v-model="tagType"
          placeholder="请选择标签类型"
          lazy
          clearable
          :load="lazyLoadNode"
          :props="tagTypeSelectProps"
        />
      </el-form-item>

      <el-form-item />

      <el-form-item>
        <slot name="footer" />
      </el-form-item>
    </div>
  </el-form>
</template>
