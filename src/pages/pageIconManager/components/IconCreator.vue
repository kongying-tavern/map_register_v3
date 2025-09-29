<script lang="ts" setup>
import { Check, Close } from '@element-plus/icons-vue'
import { WinDialog, WinDialogFooter, WinDialogTabPanel, WinDialogTitleBar } from '@/components'
import { useIconType } from '@/hooks'
import { formatByteSize } from '@/utils'
import { useIconCreate, useIconFormRules } from '../hooks'
import { ImageCropper } from './ImageCropper'

const emits = defineEmits<{
  close: []
}>()

/** 绑定表单 */
const iconForm = ref<API.IconVo>({})

/** 图标元信息 */
const iconMeta = shallowRef<{
  bmp: ImageBitmap
  blob: Blob
} | null>(null)

/** 更新逻辑封装 */
const {
  loading,
  stash,
  onSuccess,
  stashIcon,
  createIcon,
} = useIconCreate(iconForm)

/** 图标类型 */
const {
  props: typeTreeProps,
  load: loadIconType,
} = useIconType()

/** 校验规则 */
const { rules } = useIconFormRules(iconForm)

/** 确认按钮可用性 */
const disabledConfirm = computed(() => {
  const { tag = '' } = iconForm.value
  if (!tag.trim().length)
    return true
  if (!iconMeta.value)
    return true
  return false
})

onSuccess(() => {
  emits('close')
})

const { state: fileSize, isLoading, execute: refresh } = useAsyncState(async () => {
  const canvas = stash.value
  if (!canvas)
    return 0
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((data) => {
      if (!data)
        return reject(new Error('Failed execute toBlob on canvas'))
      resolve(data)
    })
  })
  return blob.size
}, 0)

const currentSize = ref({ w: 0, h: 0 })
const handleSizeChange = (size: { w: number, h: number }) => {
  currentSize.value = size
}

const debounceRefresh = useDebounceFn(refresh, 500)

watch(currentSize, ({ w: ow, h: oh }, { w, h }) => {
  if (w === ow && h === oh)
    return
  debounceRefresh()
})

/** 记录图标变更情况 */
const handleImageLoad = (bmp: ImageBitmap, blob: Blob, _: boolean, canvas: HTMLCanvasElement) => {
  iconMeta.value = { bmp, blob }
  stashIcon(canvas)
}

const cancel = () => {
  emits('close')
}
</script>

<template>
  <WinDialog>
    <WinDialogTitleBar
      class="gap-2"
      :disabled="loading"
      @close="cancel"
    >
      新建图标
    </WinDialogTitleBar>

    <WinDialogTabPanel class="w-[384px] mb-0 flex flex-col">
      <div class="w-full shrink-0 overflow-hidden flex">
        <el-form
          :rules="rules"
          :disabled="loading"
          :model="iconForm"
          label-width="60px"
          class="flex-1"
        >
          <el-form-item label="名称" prop="tag" style="margin-bottom: 16px">
            <el-input v-model="iconForm.tag" />
          </el-form-item>

          <el-form-item label="描述" prop="description" style="margin-bottom: 8px">
            <el-input v-model="iconForm.description" :rows="3" resize="none" type="textarea" />
          </el-form-item>

          <el-form-item label="类型" prop="typeIdList" style="margin-bottom: 0">
            <el-tree-select
              v-model="iconForm.typeIdList"
              lazy
              multiple
              collapse-tags
              collapse-tags-tooltip
              :load="loadIconType"
              :props="typeTreeProps"
            />
          </el-form-item>
        </el-form>
      </div>

      <el-divider style="margin: 8px 0" />

      <ImageCropper
        class="w-full flex-1"
        @image-load="handleImageLoad"
        @output-change="handleSizeChange"
      />
    </WinDialogTabPanel>

    <WinDialogFooter class="items-center">
      <div class="flex-1">
        <el-tag v-if="iconMeta" type="success">
          {{ isLoading ? '......' : formatByteSize(fileSize) }}
        </el-tag>
      </div>
      <el-button
        type="primary"
        :icon="Check"
        :disabled="disabledConfirm"
        :loading="loading"
        @click="createIcon"
      >
        确认
      </el-button>
      <el-button
        :icon="Close"
        :disabled="loading"
        @click="cancel"
      >
        取消
      </el-button>
    </WinDialogFooter>
  </WinDialog>
</template>
