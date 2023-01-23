<script lang="ts" setup>
import type L from 'leaflet'
import type { FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useMarkerEdit, useMarkerStage } from '../../hooks'
import { MarkerEditExtra, MarkerEditImage, MarkerEditSelect, MarkerEditTextarea } from '.'
import { GlobalDialogController } from '@/hooks'
import { useUserStore } from '@/stores'
import type { ElFormType } from '@/pages/pageItemManager/utils'
import { DialogController } from '@/hooks/useGlobalDialog/dialogController'

const props = defineProps<{
  latlng: L.LatLng
  itemList: API.ItemVo[]
  typeList: API.ItemTypeVo[]
  iconMap: Record<string, string>
  selectedItem?: API.ItemVo
  selectedArea?: API.AreaVo
}>()

const emits = defineEmits<{
  (e: 'refresh'): void
}>()

/** 用户数据 */
const userStore = useUserStore()
/** 是否为测试打点员 */
const isNeigui = userStore.isNeigui

/**
 * 初始化新增点位信息
 * MarkerPunctuateVo 相比 MarkerVO 的字段范围更大（只少一个 id），因此使用前者的类型来初始化
 */
const initFormData = (): API.MarkerPunctuateVo => {
  const { lat, lng } = props.latlng
  return {
    author: userStore.info.id,
    markerTitle: props.selectedItem?.name ?? '',
    content: '',
    hiddenFlag: 0,
    position: `${lat},${lng}`,
    itemList: props.selectedItem
      ? [{
          count: 1,
          iconTag: props.selectedItem.iconTag,
          itemId: props.selectedItem.itemId,
        }]
      : [],
    videoPath: '',
    markerCreatorId: userStore.info.id,
    methodType: 2,
    status: 0,
  }
}

/** 表单数据 */
const form = ref(initFormData())

/** 通用错误处理 */
const commonErrorHandler = (err: Error) => ElMessage.error(err.message)

// 非管理员走暂存审核方法
const { stageLoading, stageMarker, onStageError, onPushStagedSuccess, onPushStagedError } = useMarkerStage(form)
onPushStagedSuccess(() => {
  ElMessage.success('点位提交审核成功')
})
onPushStagedError(commonErrorHandler)
onStageError(commonErrorHandler)

// 管理员直接走点位创建方法
const { createLoading, createMarker, onCreateSuccess, onCreateError } = useMarkerEdit(form)
onCreateSuccess((res) => {
  ElMessage.success(`点位创建成功, ID 为 ${res.data}`)
  emits('refresh')
})
onCreateError(commonErrorHandler)

const loading = computed({
  get: () => userStore.isAdmin ? createLoading.value : stageLoading.value,
  set: v => userStore.isAdmin ? (createLoading.value = v) : (stageLoading.value = v),
})

/** 表单校验规则 */
const rules: FormRules = {
  markerTitle: [{
    required: true,
    validator: (_, value = '') => (form.value.markerTitle = value.trim()).length > 0,
    message: '标题不能为空（首尾空白字符会被去除）',
    trigger: 'blur',
  }],
  itemList: [{
    required: true,
    validator: () => (form.value.itemList ??= []).length > 0,
    message: '至少需要选择一项物品',
    trigger: 'change',
  }],
  videoPath: [{
    required: false,
    validator: (_, value = '') => {
      form.value.videoPath = value.trim()
      return !form.value.videoPath || /^https:\/\/www.bilibili.com\/video\/BV[a-zA-Z0-9]+/.test(form.value.videoPath)
    },
    message: '视频链接不正确(需要B站链接)',
    trigger: 'blur',
  }],
}

/** 点位提交API */
const commitMarker = async () => {
  // admin, 点位提交
  if (userStore.isAdmin) {
    await createMarker()
    return true
  }
  // 打点员，点位暂存
  form.value.status = 0
  form.value.methodType = 1
  await stageMarker()
  return true
}

/** 右侧额外面板 */
const extraId = ref('')

/** 表单实例 */
const formRef = ref<ElFormType | null>(null)

// 点位描述模板
form.value.content = props.selectedItem?.defaultContent ?? ''

const confirm = async () => {
  if (!formRef.value)
    return
  try {
    const res = await formRef.value.validate()
    loading.value = true
    const createRes = await commitMarker()
    if (res && createRes)
      DialogController.close()
  }
  catch {
    // no action
  }
  finally {
    loading.value = false
  }
}

const extraPanelRef = ref<HTMLElement | null>(null)
provide('extraPanel', extraPanelRef)
</script>

<template>
  <div class="marker-edit-form grid p-4 h-full">
    <el-form ref="formRef" :rules="rules" :model="form" class="w-96" label-width="80px">
      <el-form-item label="点位名称" prop="markerTitle">
        <el-input v-model="form.markerTitle" />
      </el-form-item>

      <el-form-item :label="`${isNeigui ? '测试点位' : '隐藏点位'}`">
        <el-switch
          v-if="!isNeigui"
          v-model="form.hiddenFlag"
          :active-value="1"
          :inactive-value="0"
          :active-text="`该点位将${form.hiddenFlag === 1 ? '不' : ''}会显示在前台`"
        />
        <el-switch
          v-if="isNeigui"
          v-model="form.hiddenFlag"
          :active-value="2"
          :inactive-value="0"
          :active-text="`该点位${form.hiddenFlag === 2 ? '' : '不'}为测试点位`"
        />
      </el-form-item>

      <el-form-item label="所属物品" prop="itemList">
        <MarkerEditSelect
          v-model="form.itemList"
          v-model:extra-id="extraId"
          :item-list="itemList"
          :type-list="typeList"
          :icon-map="iconMap"
        />
      </el-form-item>

      <el-form-item label="点位说明" prop="content">
        <MarkerEditTextarea
          v-model="form.content"
          v-model:extra-id="extraId"
          name="content"
          description="展开点位说明"
        />
      </el-form-item>

      <el-form-item label="点位图像" prop="picture">
        <MarkerEditImage
          v-model="form.picture"
          v-model:extra-id="extraId"
          v-model:creator-id="form.pictureCreatorId"
        />
      </el-form-item>

      <el-form-item label="附加数据" prop="extra">
        <MarkerEditExtra v-model="form.extra" />
      </el-form-item>

      <el-form-item label="点位视频" prop="videoPath">
        <el-input v-model="form.videoPath" />
      </el-form-item>

      <el-form-item label-width="0" style="margin-bottom: 0;">
        <div class="w-full flex justify-end">
          <el-button :disabled="loading" @click="GlobalDialogController.close">
            取消
          </el-button>
          <el-button :loading="loading" type="primary" @click="confirm">
            {{ userStore.isAdmin ? '确认' : '审核提交' }}
          </el-button>
        </div>
      </el-form-item>
    </el-form>

    <div class="extra-panel" :class="{ visible: extraId }">
      <div ref="extraPanelRef" class="extra-panel__content" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.marker-edit-form {
  grid-template-columns: 1fr auto;
}

.extra-panel {
  width: 0;
  height: 100%;
  padding-left: 0;
  transition: var(--el-transition-all);
  overflow: hidden;
  position: relative;
  .extra-panel__content {
    position: absolute;
    top: 0;
    height: 100%;
    min-width: 384px;
  }
  &.visible {
    width: 400px;
    padding-left: 1rem;
  }
}
</style>
