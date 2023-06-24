<script lang="ts" setup>
import type { ItemQueryForm } from '../hooks'
import { useAreaList, useTypeList } from '@/hooks'

const props = defineProps<{
  modelValue: ItemQueryForm
}>()

const emits = defineEmits<{
  'update:modelValue': [form: ItemQueryForm]
}>()

const model = <K extends keyof ItemQueryForm>(key: K) => computed({
  get: () => props.modelValue[key],
  set: v => emits('update:modelValue', { ...props.modelValue, [key]: v }),
})

const name = model('name')
const areaId = model('areaId')
const itemTypeId = model('itemTypeId')

const { areaTree } = useAreaList({ immediate: true })
const { typeTree } = useTypeList({ immediate: true })
</script>

<template>
  <el-form>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8">
      <el-form-item label="物品名称">
        <el-input v-model="name" clearable placeholder="请输入物品名称" style="width: 100%;" />
      </el-form-item>

      <el-form-item label="所属地区">
        <el-tree-select
          v-model="areaId"
          :data="areaTree"
          :props="{
            label: 'name',
            value: 'id',
          }"
          node-key="id"
          highlight-current
          accordion
          clearable
          style="width: 100%;"
        />
      </el-form-item>

      <el-form-item label="物品类型">
        <el-tree-select
          v-model="itemTypeId"
          :data="typeTree"
          :props="{
            label: 'name',
            value: 'id',
          }"
          node-key="id"
          highlight-current
          accordion
          clearable
          style="width: 100%;"
        />
      </el-form-item>

      <el-form-item v-if="$slots.footer" label-width="0px">
        <slot name="footer" />
      </el-form-item>
    </div>
  </el-form>
</template>
