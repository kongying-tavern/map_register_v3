<script lang="ts" setup>
// 点位数据编辑界面
// @TODO 和点位新建界面合并
import type { FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useMarkerEdit } from '../../hooks'
import { MarkerEditExtra, MarkerEditImage, MarkerEditSelect, MarkerEditTextarea } from '.'
import { GlobalDialogController, useTypeList } from '@/hooks'
import { useUserStore } from '@/stores'
import type { ElFormType } from '@/shared'
import { DialogController } from '@/hooks/useGlobalDialog/dialogController'

const props = defineProps<{
  markerInfo: API.MarkerVo
  iconMap: Record<string, string>
  itemList: API.ItemVo[]
}>()

const emits = defineEmits<{
  (e: 'refresh'): void
}>()

/** 用户信息 */
const userStore = useUserStore()

/** 是否为测试打点员 */
const isNeigui = userStore.isNeigui

const { typeList } = useTypeList()

/**
 * 初始化新增点位信息
 * MarkerPunctuateVo 相比 MarkerVO 的字段范围更大（只少一个 id），因此使用前者的类型来初始化
 */
const initFormData = (): API.MarkerPunctuateVo => {
  return {
    author: userStore.info.id,
    punctuateId: props.markerInfo.id,
    originalMarkerId: props.markerInfo.id,
    methodType: 2,
    status: 0,
    version: props.markerInfo.version ? props.markerInfo.version + 1 : 1,
    ...props.markerInfo,
  }
}

/** 表单数据 */
const form = ref(initFormData())

// 管理员直接走点位编辑方法
const { updateMarker, onEditSuccess, onEditError } = useMarkerEdit(form)
onEditSuccess(() => {
  ElMessage.success('点位编辑成功')
  emits('refresh')
})
onEditError((err: Error) => ElMessage.error(err.message))

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

/** 右侧额外面板 */
const extraId = ref('')

/** 表单实例 */
const formRef = ref<ElFormType | null>(null)
/** 图片编辑器实例 */
const imageEditorRef = ref<InstanceType<typeof MarkerEditImage> | null>(null)

/** 表单提交事件 */
const confirm = async () => {
  if (!formRef.value)
    return
  const isValid = await formRef.value.validate().catch(() => false)
  if (!isValid)
    return
  const pictureUrl = await imageEditorRef.value?.uploadPicture('测试图片')
  form.value.picture = pictureUrl
  await updateMarker()
  DialogController.close()
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
          ref="imageEditorRef"
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
          <el-button @click="GlobalDialogController.close">
            取消
          </el-button>
          <el-button type="primary" @click="confirm">
            {{ userStore.isAdmin ? '确认' : '提交审核' }}
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
