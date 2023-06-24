<script lang="ts" setup>
import { useRefreshTimeOptions } from '../hooks'
import type { ItemFormRules } from '../utils'
import { lengthCheck, requireCheck } from '../utils'
import { useAreaList, useIconList, useTypeList } from '@/hooks'
import type { ElFormType } from '@/shared'
import { HiddenFlagEnum, IconStyleTyleEnum } from '@/shared'
import { AppTimeSelect } from '@/components'

const props = defineProps<{
  modelValue: API.ItemVo
}>()

const emits = defineEmits<{
  'update:modelValue': [item: API.ItemVo]
}>()

// ==================== 表单数据 ====================
const formData = ref(props.modelValue)

// 下行同步
const { pause, resume } = pausableWatch(() => props.modelValue, () => {
  formData.value = props.modelValue
}, { deep: true })

// 上行同步
watch(formData, () => {
  pause()
  emits('update:modelValue', formData.value)
  resume()
}, { deep: true })

// ==================== 表单校验 ====================
const formRef = ref<ElFormType | null>(null)
const rules: ItemFormRules<API.ItemVo> = {
  name: [lengthCheck('blur', '名称', 10)],
  areaId: [requireCheck('change', '地区')],
  hiddenFlag: [requireCheck('change', '显示类型')],
  typeIdList: [
    { required: true, message: '至少需要一个物品类型', validator: (_, typeIds) => typeIds.length >= 1, trigger: 'change' },
  ],
}

// ==================== 物品地区 ====================
const { areaTree } = useAreaList()

// ==================== 物品类型 ====================
const { typeTree } = useTypeList()

// ==================== 显示类型 ====================
const hiddenFlagOptions = [
  { label: '显示', value: HiddenFlagEnum.SHOW },
  { label: '隐藏', value: HiddenFlagEnum.HIDDEN },
  { label: '内鬼', value: HiddenFlagEnum.NEIGUI },
]

// ==================== 物品图标 ====================
const { iconMap, iconList: rawIconList } = useIconList()
const iconList = computed(() => rawIconList.value.map(iconTag => ({
  label: iconTag.tag,
  value: iconTag.tag,
  url: iconTag.url,
})))

// ==================== 图标类型 ====================
const iconStyleOptions = [
  { label: '默认', value: IconStyleTyleEnum.DEFAULT },
  { label: '无边框', value: IconStyleTyleEnum.NO_BORDER },
  { label: '类神瞳', value: IconStyleTyleEnum.PUPIL },
  { label: '类神瞳无对钩', value: IconStyleTyleEnum.NO_TICK },
]

// ==================== 刷新时间 ====================
const { refreshTimeOptions, refreshType, customEditorDisabled } = useRefreshTimeOptions(formData)

// ==================== 其他定义 ====================
defineExpose({
  validate: () => formRef.value?.validate().catch(() => false),
})
</script>

<template>
  <el-form ref="formRef" v-bind="$attrs" label-width="80px" :model="formData" :rules="rules">
    <el-form-item label="物品名称" prop="name">
      <el-input v-model="formData.name" placeholder="请输入物品名称" />
    </el-form-item>

    <el-form-item label="描述模板" prop="defaultContent">
      <el-input v-model="formData.defaultContent" placeholder="例：在此处找到【】接取委托，完成后可获得【冒险阅历+、原石×、大英雄的经验×、摩拉×?0000】" type="textarea" :rows="3" />
    </el-form-item>

    <div class="grid grid-cols-2 gap-x-4">
      <el-form-item label="地区" prop="areaId">
        <el-tree-select
          v-model="formData.areaId"
          :data="areaTree"
          :props="{ label: 'name', value: 'id' }"
          filterable
          placeholder="选择地区"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="类型" prop="typeIdList">
        <el-tree-select
          v-model="formData.typeIdList"
          :data="typeTree"
          :props="{ label: 'name', value: 'id' }"
          collapse-tags
          collapse-tags-tooltip
          multiple
          placeholder="选择类型"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="默认数量" prop="defaultCount">
        <el-input-number v-model="formData.defaultCount" :max="5" :min="1" style="width: 100%" />
      </el-form-item>

      <el-form-item label="显示类型" prop="hiddenFlag">
        <el-select-v2 v-model="formData.hiddenFlag" :options="hiddenFlagOptions" style="width: 100%" />
      </el-form-item>

      <el-form-item label="图标类型" prop="iconStyleType">
        <el-select-v2 v-model="formData.iconStyleType" :options="iconStyleOptions" style="width: 100%" />
      </el-form-item>

      <el-form-item label="排序权重" prop="sortIndex">
        <el-input-number v-model="formData.sortIndex" :min="0" :max="99" placeholder="请输入权重" controls-position="right" style="width: 100%" />
      </el-form-item>

      <el-form-item label="物品图标" prop="iconTag">
        <el-select-v2 v-model="formData.iconTag" :options="iconList" filterable placeholder="选择图标" style="width: 100%">
          <template #default="{ item }">
            <div class="flex items-center gap-2">
              <img v-if="Boolean(item.url)" :src="item.url" class="object-contain" style="width: 34px; height: 34px; padding: 2px;" loading="lazy" crossorigin="">
              <span class="flex-1 overflow-hidden text-ellipsis whitespace-nowrap" :title="item.label">{{ item.label }}</span>
            </div>
          </template>
        </el-select-v2>
      </el-form-item>

      <el-form-item label="图标预览">
        <img v-if="formData.iconTag" class="w-8 h-8 object-contain border rounded" :src="iconMap[formData.iconTag]" crossorigin="">
      </el-form-item>

      <el-form-item label="刷新时间" prop="defaultRefreshTime">
        <el-select-v2 v-model="refreshType" :options="refreshTimeOptions" style="flex: 1" />
      </el-form-item>

      <el-form-item label-width="0px">
        <AppTimeSelect v-model="formData.defaultRefreshTime" :disabled="customEditorDisabled" style="flex: 1" />
      </el-form-item>
    </div>
  </el-form>
</template>
