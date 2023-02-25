<script lang="ts" setup>
import { cloneDeep } from 'lodash'
import { ElMessage } from 'element-plus'
import type { ItemFormRules } from '../utils'
import { lengthCheck } from '../utils'
import { useTimeRefresh } from '../hooks'
import { useAreaList, useIconList, useItemCreate, useItemUpdate, useTypeList } from '@/hooks'
import { GlobalDialogController } from '@/hooks/useGlobalDialog'
import type { ElFormType } from '@/shared'

type EditorType = 'creator' | 'editor'

const props = defineProps<{
  item: API.ItemVo
  type: EditorType
}>()

const emits = defineEmits<{
  (e: 'success'): void
}>()

const { iconMap, iconList } = useIconList()
const { areaList } = useAreaList()
const { typeList } = useTypeList()

const formData = ref<API.ItemVo>(cloneDeep(props.item))

const rules: ItemFormRules<API.ItemVo> = {
  name: [
    lengthCheck('blur', '名称', 10),
  ],
}

const { refreshTimeOptionsIndex, refreshTimeOptions, timeSelectDisabled, refreshTime } = useTimeRefresh({
  formData,
})

const hiddenFlagOptions = ref([
  {
    label: '显示',
    value: 0,
  },
  {
    label: '隐藏',
    value: 1,
  },
  {
    label: '内鬼',
    value: 2,
  },
])

const editSame = ref(false)

const formRef = ref<ElFormType | null>(null)

const { onSuccess: onItemUpdateSuccess, refresh: updateItem } = useItemUpdate({
  params: () => [formData.value],
  editSame,
})

const { onSuccess: onItemCreateSuccess, refresh: createItem } = useItemCreate({
  params: () => formData.value,
})

onItemUpdateSuccess(() => {
  emits('success')
  ElMessage.success('修改成功')
  GlobalDialogController.close()
})

onItemCreateSuccess(() => {
  emits('success')
  ElMessage.success('新建成功')
  GlobalDialogController.close()
})

const confirm = () => props.type === 'editor' ? updateItem() : createItem()

const onSubmit = async () => {
  const isValid = await formRef.value?.validate().catch(() => false)
  if (!isValid)
    return
  GlobalDialogController.updateBtnProps('submit', { props: { loading: true } })
  await confirm()
}

GlobalDialogController.registerBtn('cancel', {
  text: '取消',
  onClick: () => GlobalDialogController.close(),
})
GlobalDialogController.registerBtn('submit', {
  props: { type: 'primary' },
  text: '确认',
  onClick: () => onSubmit(),
})
</script>

<template>
  <el-form ref="formRef" class="p-4" label-width="80px" :model="formData" :rules="rules">
    <el-form-item label="名称" prop="name">
      <el-input v-model="formData.name" />
    </el-form-item>
    <el-form-item label="描述" prop="defaultContent">
      <el-input v-model="formData.defaultContent" type="textarea" />
    </el-form-item>
    <div class="grid grid-cols-2">
      <el-form-item label="地区" prop="areaId">
        <el-select v-model="formData.areaId" filterable placeholder="选择地区">
          <el-option
            v-for="obj in areaList"
            :key="obj.areaId"
            :value="obj.areaId ?? 0"
            :label="obj.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="类型" prop="typeList">
        <el-select v-model="formData.typeIdList" multiple placeholder="选择类型">
          <el-option
            v-for="obj in typeList"
            :key="obj.typeId"
            :value="obj.typeId ?? 0"
            :label="obj.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="iconStyleType">
        <el-select v-model="formData.iconStyleType" filterable disabled />
      </el-form-item>
      <el-form-item label="显隐" prop="hiddenFlag">
        <el-select v-model="formData.hiddenFlag">
          <el-option
            v-for="obj in hiddenFlagOptions"
            :key="obj.value"
            :label="obj.label"
            :value="obj.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="计数" prop="defaultCount">
        <el-input-number v-model="formData.defaultCount" :max="5" :min="1" />
      </el-form-item>
      <el-form-item label="排序" prop="sortIndex">
        <el-input-number v-model="formData.sortIndex" :min="1" :max="99" placeholder="请输入序号（越大越前）" controls-position="right" />
      </el-form-item>
      <el-form-item label="图标" prop="iconTag">
        <el-select v-model="formData.iconTag" filterable placeholder="选择图标">
          <el-option
            v-for="obj in iconList"
            :key="obj.iconId"
            :value="obj.name ?? ''"
            :label="obj.name"
          />
        </el-select>
      </el-form-item>
      <img
        class="w-8 h-8 object-contain rounded-full bg-slate-700"
        :src="iconMap[formData.iconTag ?? '']"
        crossorigin=""
      >
    </div>
    <el-form-item label="刷新" prop="defaultRefreshTime">
      <el-select v-model="refreshTimeOptionsIndex">
        <el-option
          v-for="(obj, index) in refreshTimeOptions"
          :key="obj.value"
          :value="index"
          :label="obj.label"
        />
      </el-select>
      <span>（时-分-秒）</span>
    </el-form-item>
    <el-form-item>
      <div class="flex justify-between w-full">
        <el-input-number v-model="refreshTime.days" :min="0" :max="7" controls-position="right" :disabled="timeSelectDisabled" />
        <el-input-number v-model="refreshTime.hour" :min="0" :max="23" controls-position="right" :disabled="timeSelectDisabled" />
        <el-input-number v-model="refreshTime.min" :min="0" :max="59" controls-position="right" :disabled="timeSelectDisabled" />
      </div>
    </el-form-item>
    <el-form-item v-if="type === 'editor'" label="同名修改">
      <el-switch
        v-model="editSame"
        active-text="开启"
        inactive-text="关闭"
      />
    </el-form-item>
  </el-form>
</template>
