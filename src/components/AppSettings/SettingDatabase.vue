<script lang="ts" setup>
import SettingItem from './SettingItem.vue'
import { localSettings, useAreaStore, useIconStore, useItemStore, useItemTypeStore, useMarkerStore } from '@/stores'

const areaStore = useAreaStore()
const iconStore = useIconStore()
const itemStore = useItemStore()
const itemTypeStore = useItemTypeStore()
const markerStore = useMarkerStore()
</script>

<template>
  <el-scrollbar>
    <div class="flex flex-col">
      <SettingItem
        label="地区数据"
        :content="`已存储地区数据 ${areaStore.total} 项，距离下次更新剩余 ${Math.floor(areaStore.updateAllRestTime / 1000)} 秒。`"
      >
        <el-button :loading="areaStore.updateAllLoading" @click="areaStore.clearAll">
          清除
        </el-button>
        <el-button :loading="areaStore.updateAllLoading" @click="areaStore.backgroundUpdate">
          更新
        </el-button>
      </SettingItem>

      <SettingItem
        label="物品数据"
        :content="`已存储物品数据 ${itemStore.total} 项，距离下次更新剩余 ${Math.floor(itemStore.updateAllRestTime / 1000)} 秒。`"
      >
        <el-button :loading="itemStore.updateAllLoading" @click="itemStore.clearAll">
          清除
        </el-button>
        <el-button :loading="itemStore.updateAllLoading" @click="itemStore.backgroundUpdate">
          更新
        </el-button>
      </SettingItem>

      <SettingItem
        label="物品类型数据"
        :content="`已存储类型数据 ${itemTypeStore.total} 项，距离下次更新剩余 ${Math.floor(itemTypeStore.updateAllRestTime / 1000)} 秒。`"
      >
        <el-button :loading="itemTypeStore.updateAllLoading" @click="itemTypeStore.clearAll">
          清除
        </el-button>
        <el-button :loading="itemTypeStore.updateAllLoading" @click="itemTypeStore.backgroundUpdate">
          更新
        </el-button>
      </SettingItem>

      <SettingItem
        label="图标数据"
        :content="`已存储图标数据 ${iconStore.total} 项，距离下次更新剩余 ${Math.floor(iconStore.updateAllRestTime / 1000)} 秒。`"
      >
        <el-button :loading="iconStore.updateAllLoading" @click="iconStore.clearAll">
          清除
        </el-button>
        <el-button :loading="iconStore.updateAllLoading" @click="iconStore.backgroundUpdate">
          更新
        </el-button>
      </SettingItem>

      <SettingItem
        label="点位数据"
        :content="`已存储点位数据 ${markerStore.total} 项，距离下次更新剩余 ${Math.floor(markerStore.updateAllRestTime / 1000)} 秒。`"
      >
        <el-button :loading="markerStore.updateAllLoading" @click="markerStore.clearAll">
          清除
        </el-button>
        <el-button :loading="markerStore.updateAllLoading" @click="markerStore.backgroundUpdate">
          更新
        </el-button>
      </SettingItem>

      <SettingItem label="定时更新" content="定时更新物品和点位数据的时间间隔（分钟），定时修改只会在下次更新后生效。">
        <el-input-number v-model="localSettings.autoUpdateInterval" :min="10" :max="120" :step="10" />
      </SettingItem>
    </div>
  </el-scrollbar>
</template>
