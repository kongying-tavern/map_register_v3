<script lang="ts" setup>
import { Plus, Setting } from '@element-plus/icons-vue'
import { MapAffix } from '../../components'
import type { Coordinate2D } from '../../core'
import { useMap } from '@/pages/pageMapV2/hooks'
import { MarkerCreatePanel } from '@/pages/pageMapV2/components'
import { AppSettings, GSButton } from '@/components'
import { useGlobalDialog } from '@/hooks'
import { vMarkeable } from '@/directives'
import { useMapStore } from '@/stores'
import db from '@/database'

const { onMapReady } = useMap()
const mapStore = useMapStore()

const coordinate = shallowRef<Coordinate2D | null>(null)

const closeContextmenu = () => {
  coordinate.value = null
}

mapStore.$onAction((ctx) => {
  ctx.name === 'setMission' && closeContextmenu()
})

onMapReady(mapInstance => mapInstance.event.on('click', async (info, ev) => {
  if (!ev.rightButton || mapStore.mission)
    return closeContextmenu()
  coordinate.value = mapInstance.unprojectCoord(info.coordinate as Coordinate2D)
}))

const { DialogService } = useGlobalDialog()

const openMarkerCreator = async () => {
  const areaCode = mapStore.markingItem ? (await db.area.where('id').equals(mapStore.markingItem.areaId!).first())?.code : ''
  DialogService
    .config({
      title: '添加点位',
      width: 'fit-content',
      alignCenter: true,
      showClose: false,
      closeOnClickModal: false,
      closeOnPressEscape: false,
    })
    .props({
      coordinate: coordinate.value,
      initAreaCode: areaCode,
      defaultItem: mapStore.markingItem,
    })
    .open(MarkerCreatePanel)
  closeContextmenu()
}

const openSettingDialog = () => {
  DialogService
    .config({
      title: '系统设置',
      alignCenter: true,
      width: 'fit-content',
    })
    .open(AppSettings)
  closeContextmenu()
}
</script>

<template>
  <Transition name="fade">
    <MapAffix v-if="coordinate" :pos="coordinate">
      <div class="context-menu ml-2 mt-2 flex flex-col gap-1 relative" @contextmenu.stop="ev => ev.preventDefault()">
        <GSButton v-markeable @click="openMarkerCreator">
          <template #icon>
            <el-icon color="var(--gs-color-confirm)">
              <Plus />
            </el-icon>
          </template>
          添加点位
        </GSButton>

        <GSButton @click="openSettingDialog">
          <template #icon>
            <el-icon color="var(--el-color-primary)">
              <Setting />
            </el-icon>
          </template>
          系统设置
        </GSButton>
      </div>
    </MapAffix>
  </Transition>
</template>

<style lang="scss" scoped>
.context-menu {
  border-radius: 6px;
  filter: drop-shadow(0 0 6px #333);
  background: transparent;

  &::before {
    content: '';
    position: absolute;
    top: -8px;
    left: -8px;
    width: 100px;
    height: 100px;
    background:
      linear-gradient(to bottom, transparent calc(50% - 0.5px), red calc(50% - 0.5px), red calc(50% + 0.5px), transparent calc(50% + 0.5px)),
      linear-gradient(to right, transparent calc(50% - 0.5px), red calc(50% - 0.5px), red calc(50% + 0.5px), transparent calc(50% + 0.5px));
    translate: -50% -50%;
    pointer-events: none;
    z-index: -1;
  }
}
</style>
