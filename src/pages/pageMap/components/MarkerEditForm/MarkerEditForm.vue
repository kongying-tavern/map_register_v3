<script lang="ts" setup>
import type L from 'leaflet'
import type { FormRules } from 'element-plus'
import { useMarkerStage } from '../../hooks'
import { MarkerEditImage, MarkerEditSelect, MarkerEditTextarea } from '.'
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
}>()

const userStore = useUserStore()

const { markerData: form, loading } = useMarkerStage({
  markerTitle: props.selectedItem?.name ?? '',
  content: '',
  hiddenFlag: 0,
  itemList: props.selectedItem
    ? [{
        count: 1,
        iconTag: props.selectedItem.iconTag,
        itemId: props.selectedItem.itemId,
      }]
    : [],
  videoPath: '',
})

const rules: FormRules = {
  markerTitle: [{
    required: true,
    validator: () => (form.value.markerTitle = form.value.markerTitle?.trim() ?? '').length > 0,
    message: '标题不能为空（首尾空白字符会被去除）',
    trigger: 'blur',
  }],
  itemList: [{
    required: true,
    validator: (_, value) => value.length > 0,
    message: '至少需要选择一项物品',
    trigger: 'change',
  }],
  videoPath: [{
    required: false,
    validator: () => (
      form.value.videoPath.length != 0
      && form.value.videoPath.search('^https://www.bilibili.com/video/BV[a-zA-Z0-9]+') != -1
    ),
    message: '视频链接不正确(需要B站链接)',
    trigger: 'blur',
  }],
}

/** 右侧额外面板 */
const extraId = ref('')

/** 表单实例 */
const formRef = ref<ElFormType | null>(null)

const confirm = async () => {
  if (!formRef.value)
    return
  try {
    const res = await formRef.value.validate()
    res && DialogController.close()
  }
  catch (err) {
    console.log('校验错误', err)
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

      <el-form-item label="隐藏点位">
        <el-switch
          v-model="form.hiddenFlag"
          :active-value="1"
          :inactive-value="0"
          :active-text="`该点位将${form.hiddenFlag === 1 ? '不' : ''}会显示在前台`"
        />
      </el-form-item>

      <el-form-item label="所属物品" prop="itemList">
        <MarkerEditSelect
          v-model="form.itemList"
          v-model:extra-visible="extraId"
          :item-list="itemList"
          :type-list="typeList"
          :icon-map="iconMap"
        />
      </el-form-item>

      <el-form-item label="点位说明">
        <MarkerEditTextarea v-model="form.content" v-model:extra-visible="extraId" name="content" description="展开点位说明" />
      </el-form-item>

      <el-form-item label="点位图像">
        <MarkerEditImage
          v-model="form.picture"
          v-model:extra-visible="extraId"
          v-model:creator-id="form.pictureCreatorId"
        />
      </el-form-item>

      <el-form-item label="点位视频" prop="videoPath">
        <el-input v-model="form.videoPath" />
      </el-form-item>

      <el-form-item label-width="0" style="margin-bottom: 0;">
        <div class="w-full flex justify-end">
          <el-button :loading="loading" @click="GlobalDialogController.close">
            取消
          </el-button>
          <el-button :loading="loading" type="primary" @click="confirm">
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
