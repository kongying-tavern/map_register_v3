<script lang="ts" setup>
import { useUserStore } from '@/stores'
import { Check, Close } from '@element-plus/icons-vue'
import { MarkerForm } from './components'
import { useMarkerCreate } from './hooks'

const props = defineProps<{
  coordinate: API.Coordinate2D
  defaultItem?: API.ItemVo
}>()

const emits = defineEmits<{
  close: []
}>()

const userStore = useUserStore()

/** 初始化新增点位信息 */
const initFormData = (): API.MarkerVo => {
  const [x, y] = props.coordinate
  return {
    markerTitle: props.defaultItem?.name ?? '',
    content: props.defaultItem?.defaultContent ?? '',
    hiddenFlag: 0,
    position: `${x},${y}`,
    itemList: props.defaultItem
      ? [{
          count: props.defaultItem.defaultCount ?? 1,
          iconTag: props.defaultItem.iconTag,
          itemId: props.defaultItem.id,
        }]
      : [],
    videoPath: '',
    refreshTime: props.defaultItem?.defaultRefreshTime ?? 0,
    markerCreatorId: userStore.info?.id,
  }
}

/** 表单数据 */
const form = ref(initFormData())

const { editorRef, loading, createMarker, onSuccess } = useMarkerCreate(form)

onSuccess(() => emits('close'))
</script>

<template>
  <MarkerForm
    ref="editorRef"
    v-model="form"
    title="新增点位"
    :loading="loading"
    @close="() => emits('close')"
  >
    <template #footer>
      <div class="w-full flex justify-end">
        <el-button :icon="Check" :loading="loading" type="primary" @click="createMarker">
          添加
        </el-button>
        <el-button :icon="Close" :disabled="loading" @click="() => emits('close')">
          取消
        </el-button>
      </div>
    </template>
  </MarkerForm>
</template>
