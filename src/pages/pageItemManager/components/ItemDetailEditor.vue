<script lang="ts" setup>
import { cloneDeep } from 'lodash'
import { ElCol, ElForm, ElFormItem, ElInput, ElInputNumber, ElOption, ElRow, ElSelect } from 'element-plus'
import type { ItemFormRules } from '../utils'
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

const formRef = ref<InstanceType<typeof ElForm> | null>(null)

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
  <ElForm ref="formRef" label-width="60px" :model="formData" :rules="rules">
    <ElFormItem label="名称" prop="name">
      <ElInput v-model="formData.name" />
    </ElFormItem>
    <ElFormItem label="描述" prop="defaultContent">
      <ElInput v-model="formData.defaultContent" type="textarea" />
    </ElFormItem>
    <ElRow :gutter="20">
      <ElCol :span="12">
        <ElFormItem label="地区" prop="areaId">
          <ElSelect v-model="formData.areaId" filterable placeholder="选择地区">
            <ElOption
              v-for="item in areaList"
              :key="item.areaId"
              :value="item.areaId"
              :label="item.name"
            />
          </ElSelect>
        </ElFormItem>
      </ElCol>
      <ElCol :span="12">
        <ElFormItem label="类型" prop="typeList">
          <ElSelect v-model="formData.typeIdList" multiple placeholder="选择类型">
            <ElOption
              v-for="item in typeList"
              :key="item.typeId"
              :value="item.typeId"
              :label="item.name"
            />
          </ElSelect>
        </ElFormItem>
      </ElCol>
    </ElRow>
    <ElRow :gutter="20">
      <ElCol :span="12">
        <ElFormItem label="图标" prop="iconTag">
          <ElSelect v-model="formData.iconTag" filterable placeholder="选择图标">
            <ElOption
              v-for="item in iconList"
              :key="item.iconId"
              :value="item.name"
              :label="item.name"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="状态" prop="iconStyleType">
          <ElSelect v-model="formData.iconStyleType" filterable disabled />
        </ElFormItem>
      </ElCol>
      <ElCol :span="12">
        <img
          class="w-8 h-8 object-contain rounded-full bg-slate-700"
          :src="iconMap[formData.iconTag ?? '']"
        >
      </ElCol>
    </ElRow>
    <ElRow :gutter="20">
      <ElCol :span="12">
        <ElFormItem label="显隐" prop="hiddenFlag">
          <ElSelect v-model="formData.hiddenFlag">
            <ElOption
              v-for="item in hiddenFlagOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
      </ElCol>
      <ElCol :span="12">
        <ElFormItem label="计数" prop="defaultCount">
          <ElInputNumber v-model="formData.defaultCount" :max="5" :min="1" />
        </ElFormItem>
      </ElCol>
    </ElRow>
    <ElFormItem label="刷新" prop="defaultRefreshTime">
      <div style="width: 100%;">
        <el-row :gutter="10">
          <el-col :span="6">
            <ElSelect v-model="refreshTimeOptionsIndex">
              <ElOption
                v-for="(item, index) in refreshTimeOptions"
                :key="item.value"
                :value="index"
                :label="item.label"
              />
            </ElSelect>
          </el-col>
        </el-row>
        <el-row :gutter="5">
          <el-col :span="6">
            <ElInputNumber v-model="refreshTime.days" :min="0" :max="7" controls-position="right" :disabled="timeSelectDisabled" />
          </el-col>
          <el-col :span="2">
            <span>- 天</span>
          </el-col>
          <el-col :span="6">
            <ElInputNumber v-model="refreshTime.hour" :min="0" :max="23" controls-position="right" :disabled="timeSelectDisabled" />
          </el-col>
          <el-col :span="2">
            <span>- 时</span>
          </el-col>
          <el-col :span="6">
            <ElInputNumber v-model="refreshTime.min" :min="0" :max="59" controls-position="right" :disabled="timeSelectDisabled" />
          </el-col>
          <el-col :span="2">
            <span>- 分</span>
          </el-col>
        </el-row>
        <el-row :gutter="10">

        </el-row>
        <el-row :gutter="10">

        </el-row>
      </div>
    </ElFormItem>
    <ElFormItem label="排序" prop="sortIndex">
      <ElInputNumber v-model="formData.sortIndex" :min="1" :max="99" placeholder="请输入序号（越大越前）" controls-position="right" />
    </ElFormItem>
  </ElForm>
</template>
