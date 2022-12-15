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
</script>

<template>
  <el-form class="marker-form p-4" label-width="80px">
    <el-form-item label="点位名称">
      <el-input v-model="markerData.markerTitle" />
    </el-form-item>

    <el-form-item label="隐藏点位">
      <el-switch v-model="markerData.hiddenFlag" :active-value="1" :inactive-value="0" />
    </el-form-item>

    <el-form-item label="所属物品">
      <div>字段交互开发中</div>
    </el-form-item>

    <el-form-item label="点位说明">
      <el-input v-model="markerData.content" type="textarea" :rows="3" />
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
</template>
