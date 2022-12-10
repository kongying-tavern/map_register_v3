<script lang="ts" setup>
import { cloneDeep } from 'lodash'
import type { ElFormType, ItemFormRules } from '../utils'
import { emptyCheck, lengthCheck } from '../utils'
import { useTimeRefresh } from '../hooks'
import { useAreaList, useTypeList } from '@/hooks'
import { GlobalDialogController } from '@/hooks/useGlobalDialog'

const props = defineProps<{
  item: API.ItemVo
  iconList: API.IconVo[]
  areaList: API.AreaVo[]
  iconMap: Record<string, string>
}>()

const emits = defineEmits<{
  (e: 'success'): void
}>()

const formData = ref<API.ItemVo>({})

onMounted(() => {
  formData.value = cloneDeep(props.item)
  console.log(props.iconMap)
})

const rules: ItemFormRules<API.ItemVo> = {
  name: [
    lengthCheck('blur', '名称', 10),
    emptyCheck(),
  ],
}

const { typeList } = useTypeList({
  immediate: true,
})

const { areaList } = useAreaList({
  immediate: true,
})

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

const formRef = ref<ElFormType | null>(null)

const onSubmit = async () => {
  // const { onSuccess } = useItemUpdate({
  //   params: () => [formData.value],
  //   editSame: false
  // })
  const isValid = await formRef.value?.validate().catch(() => false)
  if (isValid) {
    emits('success')
    console.log(formData.value)
  }
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
  <el-form ref="formRef" label-width="60px" :model="formData" :rules="rules">
    <el-form-item label="名称" prop="name">
      <el-input v-model="formData.name" />
    </el-form-item>
    <el-form-item label="描述" prop="defaultContent">
      <el-input v-model="formData.defaultContent" type="textarea" />
    </el-form-item>
    <el-row :gutter="20">
      <el-col :span="12">
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
      </el-col>
      <el-col :span="12">
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
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
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
        <el-form-item label="状态" prop="iconStyleType">
          <el-select v-model="formData.iconStyleType" filterable disabled />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <img
          class="w-8 h-8 object-contain rounded-full bg-slate-700"
          :src="iconMap[formData.iconTag ?? '']"
        >
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
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
      </el-col>
      <el-col :span="12">
        <el-form-item label="计数" prop="defaultCount">
          <el-inputNumber v-model="formData.defaultCount" :max="5" :min="1" />
        </el-form-item>
      </el-col>
    </el-row>
    <el-form-item label="刷新" prop="defaultRefreshTime">
      <div style="width: 100%;">
        <el-row :gutter="10">
          <el-col :span="6">
            <el-select v-model="refreshTimeOptionsIndex">
              <el-option
                v-for="(obj, index) in refreshTimeOptions"
                :key="obj.value"
                :value="index"
                :label="obj.label"
              />
            </el-select>
          </el-col>
        </el-row>
        <el-row :gutter="5">
          <el-col :span="6">
            <el-inputNumber v-model="refreshTime.days" :min="0" :max="7" controls-position="right" :disabled="timeSelectDisabled" />
          </el-col>
          <el-col :span="2">
            <span>- 天</span>
          </el-col>
          <el-col :span="6">
            <el-inputNumber v-model="refreshTime.hour" :min="0" :max="23" controls-position="right" :disabled="timeSelectDisabled" />
          </el-col>
          <el-col :span="2">
            <span>- 时</span>
          </el-col>
          <el-col :span="6">
            <el-inputNumber v-model="refreshTime.min" :min="0" :max="59" controls-position="right" :disabled="timeSelectDisabled" />
          </el-col>
          <el-col :span="2">
            <span>- 分</span>
          </el-col>
        </el-row>
        <el-row :gutter="10" />
        <el-row :gutter="10" />
      </div>
    </el-form-item>
    <el-form-item label="排序" prop="sortIndex">
      <el-inputNumber v-model="formData.sortIndex" :min="1" :max="99" placeholder="请输入序号（越大越前）" controls-position="right" />
    </el-form-item>
  </el-form>
</template>
