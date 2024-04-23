<script lang="ts" setup>
import type { ItemFormRules } from '@/utils'
import { lengthCheck, requireCheck } from '@/utils'
import { useBinaryFlag, useIconList, useRefreshTime } from '@/hooks'
import type { ElFormType } from '@/shared'
import { HIDDEN_FLAG_OPTIONS, IconStyleTyleEnum } from '@/shared'
import { AppTimeSelect } from '@/components'
import { useAccessStore, useAreaStore, useItemTypeStore } from '@/stores'

const props = defineProps<{
  modelValue: API.ItemVo
}>()

const emits = defineEmits<{
  'update:modelValue': [item: API.ItemVo]
}>()

const accessStore = useAccessStore()

// ==================== 表单数据 ====================
const formData = ref(props.modelValue)

const isIntarnalChange = ref(false)

// 下行同步
watch(() => props.modelValue, () => {
  if (isIntarnalChange.value)
    return (isIntarnalChange.value = false)
  formData.value = props.modelValue
}, { deep: true })

// 上行同步
watch(formData, () => {
  isIntarnalChange.value = true
  emits('update:modelValue', formData.value)
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
const areaStore = useAreaStore()
const areaList = computed(() => areaStore.areaList
  .filter(area => area.isFinal)
  .sort(({ sortIndex: ia = 0 }, { sortIndex: ib = 0 }) => ib - ia),
)

// ==================== 物品类型 ====================
const itemTypeStore = useItemTypeStore()
const itemTypeList = computed(() => itemTypeStore.itemTypeList
  .filter(itemType => itemType.isFinal)
  .sort(({ sortIndex: ia = 0 }, { sortIndex: ib = 0 }) => ib - ia),
)

// ==================== 显示类型 ====================
const hiddenFlagOptions = useArrayFilter(HIDDEN_FLAG_OPTIONS, ({ value }) => accessStore.checkHiddenFlag(value))

// ==================== 物品图标 ====================
const { iconMap, iconList: rawIconList } = useIconList()
const iconList = computed(() => rawIconList.value.map(iconTag => ({
  label: iconTag.tag!,
  value: iconTag.tag!,
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
const refreshTime = computed({
  get: () => formData.value.defaultRefreshTime,
  set: v => (formData.value.defaultRefreshTime = v),
})
const { refreshTimeType, refreshTimeTypeOptions, isCustom } = useRefreshTime(refreshTime)

// ==================== 特殊标识 ====================
const { teleportable } = useBinaryFlag(toRef(formData.value, 'specialFlag'), {
  teleportable: 0,
  iconCustomized: 1,
})

// ==================== 其他定义 ====================
defineExpose({
  validate: () => formRef.value?.validate().catch(() => false),
})
</script>

<template>
  <el-form ref="formRef" v-bind="$attrs" label-width="80px" :model="formData" :rules="rules">
    <div class="grid grid-cols-2 gap-x-4">
      <el-form-item label="物品名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入物品名称" />
      </el-form-item>

      <el-form-item label="可传送" title="是否为传送点位" prop="specialFlag">
        <el-switch v-model="teleportable" />
      </el-form-item>
    </div>

    <el-form-item label="描述模板" prop="defaultContent">
      <el-input
        v-model="formData.defaultContent"
        placeholder="例：在此处找到【】接取委托，完成后可获得【冒险阅历+、原石×、大英雄的经验×、摩拉×?0000】"
        type="textarea"
        :rows="3"
      />
    </el-form-item>

    <div class="grid grid-cols-2 gap-x-4">
      <el-form-item label="地区" prop="areaId">
        <el-select-v2
          v-model="formData.areaId"
          :options="areaList"
          :props="{ label: 'name', value: 'id' }"
          filterable
          placeholder="选择地区"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="类型" prop="typeIdList">
        <el-select-v2
          v-model="formData.typeIdList"
          :options="itemTypeList"
          :props="{ label: 'name', value: 'id' }"
          filterable
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
        <el-input-number v-model="formData.sortIndex" :min="0" :max="99" placeholder="请输入权重" style="width: 100%" />
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
        <el-select-v2 v-model="refreshTimeType" :options="refreshTimeTypeOptions" style="flex: 1" />
      </el-form-item>

      <el-form-item label-width="0px">
        <AppTimeSelect v-model="refreshTime" :disabled="!isCustom" style="flex: 1" />
      </el-form-item>
    </div>
  </el-form>
</template>
