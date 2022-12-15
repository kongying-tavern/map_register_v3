<script lang="ts" setup>
import type L from 'leaflet'
import { useMarkerStage } from '../hooks'
import { GlobalDialogController } from '@/hooks'
import { useUserStore } from '@/stores'

const props = defineProps<{
  latlng: L.LatLng
  selectedItem?: API.ItemVo
}>()

const userStore = useUserStore()

const { markerData, loading } = useMarkerStage({
  markerTitle: props.selectedItem?.name ?? '',
  content: '',
  hiddenFlag: 0,
  itemList: [],
})

const setupVisible = ref(false)
const toggleSetupVisible = () => {
  setupVisible.value = !setupVisible.value
}
</script>

<template>
  <div class="flex p-4">
    <el-form class="w-96" label-width="80px">
      <el-form-item label="点位名称">
        <el-input v-model="markerData.markerTitle" />
      </el-form-item>

      <el-form-item label="隐藏点位">
        <el-switch v-model="markerData.hiddenFlag" :active-value="1" :inactive-value="0" />
      </el-form-item>

      <el-form-item label="所属物品">
        <el-button @click="toggleSetupVisible">
          编辑所属点位
        </el-button>
      </el-form-item>

      <el-form-item label="点位说明">
        <el-input v-model="markerData.content" type="textarea" :rows="3" resize="none" />
      </el-form-item>

      <el-form-item label="点位图像">
        <div>字段交互开发中</div>
      </el-form-item>

      <el-form-item label="点位视频">
        <div>字段交互开发中</div>
      </el-form-item>

      <el-form-item label-width="0" style="margin-bottom: 0;">
        <div class="w-full flex justify-end">
          <el-button :loading="loading" @click="GlobalDialogController.close">
            取消
          </el-button>
          <el-button :loading="loading" type="primary">
            {{ userStore.isAdmin ? '确认' : '提交审核' }}
          </el-button>
        </div>
      </el-form-item>
    </el-form>

    <div class="panel-block" :class="{ visible: setupVisible }">
      <transition name="fade" mode="out-in">
        <div v-if="setupVisible" class="panel-block__wrapper h-full border bg-red-300">
          额外面板
        </div>
      </transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.panel-block {
  width: 0;
  padding-left: 0;
  transition: all cubic-bezier(0.4, 0, 0.2, 1) 200ms;
  overflow: hidden;
  &.visible {
    width: 400px;
    padding-left: 1rem;
  }
}

.panel-block__wrapper {
  min-width: 384px;
}

.item-transfer {
  display: flex;
  width: 100%;
  :deep(.el-transfer__buttons) {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4px;
    gap: 4px;
    .el-transfer__button:nth-child(2) {
      margin: 0;
    }
  }
}
</style>
