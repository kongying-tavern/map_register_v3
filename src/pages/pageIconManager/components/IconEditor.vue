<script lang="ts" setup>
import { Check, Close } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import Api from '@/api/api'
import { IconRenderer, WinDialog, WinDialogFooter, WinDialogTabPanel, WinDialogTitleBar } from '@/components'
import { formatByteSize } from '@/utils'
import { useIconFormRules, useIconUpdate } from '../hooks'
import { ImageCropper } from './ImageCropper'

const props = defineProps<{
  icon: API.IconVo
}>()

const emits = defineEmits<{
  close: []
}>()

/** 原始表单 */
const rawJSON = JSON.stringify(props.icon)

/** 用户信息 */
const { state: userMap } = useAsyncState(async () => {
  const map = new Map<number, API.SysUserVo>()
  const { creatorId, updaterId } = props.icon
  if (creatorId !== undefined) {
    const { data: creator = {} } = await Api.user.getUserInfo({ userId: creatorId })
    map.set(creatorId, creator)
  }
  if (updaterId !== undefined && updaterId !== creatorId) {
    const { data: updator = {} } = await Api.user.getUserInfo({ userId: updaterId })
    map.set(updaterId, updator)
  }
  return map
}, new Map<number, API.SysUserVo>())

/** 绑定表单 */
const iconForm = ref<API.IconVo>(JSON.parse(rawJSON))

/** 是否启用图像编辑 */
const iconEditable = ref(false)

/** 原始图标元信息 */
const rawIconMeta = shallowRef<{
  bmp: ImageBitmap
  blob: Blob
} | null>(null)

/** 更新逻辑封装 */
const {
  isChanged,
  loading,
  onSuccess,
  stashIcon,
  clearStash,
  updateIcon,
} = useIconUpdate(iconForm, {
  iconEditable,
})

/** 校验规则 */
const { rules } = useIconFormRules(iconForm)

/** 确认按钮可用性 */
const disabledConfirm = computed(() => {
  const { tag = '' } = iconForm.value
  if (!tag.trim().length)
    return true
  if ([
    props.icon.tag === iconForm.value.tag,
    props.icon.description === iconForm.value.description,
    JSON.stringify(props.icon.typeIdList ?? []) === JSON.stringify(iconForm.value.typeIdList ?? []),
    !iconEditable.value || (iconEditable.value && !isChanged.value),
  ].every(Boolean)) {
    return true
  }
  return false
})

onSuccess(() => {
  emits('close')
})

/** 记录图标变更情况 */
const handleImageLoad = (bmp: ImageBitmap, blob: Blob, isRaw: boolean, canvas: HTMLCanvasElement) => {
  if (isRaw) {
    rawIconMeta.value = { bmp, blob }
    clearStash()
    return
  }
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
      <el-tag size="small" type="warning">
        ID: {{ props.icon.id }}
      </el-tag>
      <div>
        {{ props.icon.tag }}
      </div>
    </WinDialogTitleBar>

    <WinDialogTabPanel class="w-[384px] mb-0 flex flex-col">
      <div class="w-full shrink-0 overflow-hidden flex">
        <div
          class="shrink-0 relative toggle-cropper border border-[var(--el-border-color)] rounded overflow-hidden"
          :class="{
            'is-editting': iconEditable,
          }"
        >
          <IconRenderer
            class="w-[120px] h-[120px]"
            :icon-id="props.icon.id"
            @click="iconEditable = !iconEditable"
          />
        </div>

        <el-form
          :disabled="loading"
          :rules="rules"
          :model="iconForm"
          label-width="60px"
          class="flex-1"
        >
          <el-form-item label="名称" prop="tag" style="margin-bottom: 17px;">
            <el-input v-model="iconForm.tag" />
          </el-form-item>

          <el-form-item label="描述" prop="description" style="margin-bottom: 0;">
            <el-input v-model="iconForm.description" :rows="3" resize="none" type="textarea" />
          </el-form-item>
        </el-form>
      </div>

      <el-divider style="margin: 8px 0" />

      <div class="grid grid-cols-2 place-items-start text-xs">
        <div class="w-full grid grid-cols-[60px_1fr]">
          <div>分辨率</div>
          <div>
            {{ rawIconMeta ? `${rawIconMeta.bmp.width.toFixed(2)} x ${rawIconMeta.bmp.height.toFixed(2)}` : 'Loading...' }}
          </div>
          <div>文件大小</div>
          <div>
            {{ rawIconMeta ? formatByteSize(rawIconMeta.blob.size) : 'Loading...' }}
          </div>
        </div>
        <div class="w-full grid grid-cols-[60px_1fr]">
          <div class="w-full overflow-hidden whitespace-nowrap text-ellipsis">
            创建人
          </div>
          <div class="w-full overflow-hidden whitespace-nowrap text-ellipsis">
            {{ userMap.get(icon.creatorId ?? -1)?.nickname || `(ID: ${icon.creatorId})` }}
          </div>
          <div class="w-full overflow-hidden whitespace-nowrap text-ellipsis">
            创建时间
          </div>
          <div class="w-full overflow-hidden whitespace-nowrap text-ellipsis">
            {{ icon.createTime ? dayjs(icon.createTime).format('YYYY-MM-DD HH:mm:ss') : '--N/A--' }}
          </div>
          <div class="w-full overflow-hidden whitespace-nowrap text-ellipsis">
            最后修改
          </div>
          <div class="w-full overflow-hidden whitespace-nowrap text-ellipsis">
            {{ userMap.get(icon.updaterId ?? -1)?.nickname || `(ID: ${icon.updaterId})` }}
          </div>
          <div class="w-full overflow-hidden whitespace-nowrap text-ellipsis">
            修改时间
          </div>
          <div class="w-full overflow-hidden whitespace-nowrap text-ellipsis">
            {{ icon.updateTime ? dayjs(icon.updateTime).format('YYYY-MM-DD HH:mm:ss') : '--N/A--' }}
          </div>
        </div>
      </div>

      <div
        class="transition-[height] overflow-visible"
        :class="iconEditable ? 'h-[297px]' : 'h-0'"
      >
        <el-divider style="margin: 8px 0" />
        <ImageCropper
          :raw="props.icon.url"
          class="w-full flex-1"
          @image-load="handleImageLoad"
        />
      </div>
    </WinDialogTabPanel>

    <WinDialogFooter class="items-center">
      <div class="flex-1">
        <el-tag v-if="iconEditable && isChanged" disable-transitions type="success">
          将会更新图片
        </el-tag>
      </div>
      <el-button
        type="primary"
        :icon="Check"
        :disabled="disabledConfirm"
        :loading="loading"
        @click="updateIcon"
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

<style scoped>
.toggle-cropper {
  --content: '编辑图片';
  --bg: var(--el-color-primary);
  --bg-alpha: 0%;
  --text-alpha: 0%;

  cursor: pointer;

  &::before {
    content: var(--content);
    border-radius: 4px;
    display: grid;
    place-content: center;
    color: color-mix(in srgb, var(--el-color-white) var(--text-alpha), transparent calc(100% - var(--text-alpha)));
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    opacity: var(--alpha);
    background-color: color-mix(in srgb, var(--bg) var(--bg-alpha), transparent calc(100% - var(--bg-alpha)));
    z-index: 1;
    pointer-events: none;
  }

  &:hover {
    --text-alpha: 100%;
    --bg-alpha: 50%;
  }
  &:active {
    --bg-alpha: 30%;
  }

  &.is-editting {
    --bg: var(--el-color-warning);
    --content: '取消编辑';
    border-color: var(--el-color-warning);
  }
}
</style>
