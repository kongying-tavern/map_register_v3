<script lang="ts" setup>
import { Plus, Setting } from '@element-plus/icons-vue'
import type { UploadFile } from 'element-plus'
import { ElIcon, ElMessage, ElUpload } from 'element-plus'
import { MarkerEditImageExtraPanel, TeleportExtra } from '.'

const props = defineProps<{
  /** 图片地址 */
  modelValue?: string
  /** 图片上传者 id */
  creatorId?: number
  extraVisible: string
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', v?: string): void
  (e: 'update:creatorId', v?: number): void
  (e: 'update:extraVisible', v: string): void
}>()

const uploaderRef = ref<InstanceType<typeof ElUpload> | null>(null)

const imgUrl = ref('')
const imageBitMap = shallowRef<ImageBitmap | null>(null)

const onFileChange = async (uploadFile: UploadFile) => {
  // 不需要文件列表，清理掉之前的缓存
  uploaderRef.value?.handleRemove(uploadFile)
  const { raw } = uploadFile
  if (!raw) {
    ElMessage.error('文件可能已被删除或移动到其他位置，请重试')
    return
  }
  if (!/image\//.test(raw.type)) {
    ElMessage.error('只能选择图像文件')
    return
  }
  imgUrl.value && URL.revokeObjectURL(imgUrl.value)
  imgUrl.value = URL.createObjectURL(raw)
  const blob = new Blob([await raw.arrayBuffer()])
  imageBitMap.value = await createImageBitmap(blob)
}

const extraActive = computed(() => props.extraVisible === 'picture')
const toggleExtraPanel = () => {
  emits('update:extraVisible', extraActive.value ? '' : 'picture')
}

watch(imgUrl, (url) => {
  url && emits('update:extraVisible', 'picture')
})
</script>

<template>
  <div class="w-full flex justify-between items-start gap-1">
    <ElUpload
      ref="uploaderRef"
      accept="image/*"
      :auto-upload="false"
      :show-file-list="false"
      @change="onFileChange"
    >
      <div class="picture-uploader" :class="{ active: extraActive }">
        <img v-if="imgUrl" :src="imgUrl" class="w-full h-full object-cover">

        <div v-else class="w-full h-full flex flex-col items-center justify-center">
          <ElIcon :size="24">
            <Plus />
          </ElIcon>
          选择图片
        </div>
      </div>
    </ElUpload>

    <el-button :icon="Setting" :type="extraActive ? 'primary' : ''" title="编辑图像" circle @click="toggleExtraPanel" />

    <TeleportExtra :active="extraActive">
      <MarkerEditImageExtraPanel :image-bit-map="imageBitMap" />
    </TeleportExtra>
  </div>
</template>

<style lang="scss" scoped>
.picture-uploader {
  border: 1px dashed var(--el-border-color);
  width: 160px;
  height: 160px;
  border-radius: var(--el-border-radius-base);
  transition: var(--el-transition-duration-fast);
  color: var(--el-text-color-secondary);
  overflow: hidden;
  &:hover {
    border-color: var(--el-color-primary);
  }
  &.active {
    border-style: solid;
    border-color: var(--el-color-primary);
  }
}
</style>
