<script lang="ts" setup>
import { CloseBold, DeleteFilled, Edit, LocationFilled, Select } from '@element-plus/icons-vue'
import type { Coordinate2D } from '../../core'
import { MarkerStateSwitch } from '.'
import { GSButton } from '@/components'
import { useArchiveStore } from '@/stores'
import { useInteractionLayer, useMarkerCollimator, useMarkerDrawer } from '@/pages/pageMapV2/hooks'
import { MarkerEditPanel } from '@/pages/pageMapV2/components'
import db from '@/database'
import { vMarkeable } from '@/directives'

const drawerRef = ref<HTMLElement | null>(null) as Ref<HTMLElement>

const { visible: interactionLayerVisible } = useInteractionLayer()
const { cachedMarkerVo, focus, blur } = useMarkerDrawer()
const { collimatorVisible, cancel, showCollimator } = useMarkerCollimator()
const archiveStore = useArchiveStore()

/** 点位信息表单弹窗可见性 */
const markerFormVisible = ref(false)
/** 抽屉可见性 */
const drawerVisible = computed(() => Boolean(focus.value))
/** 修改后的点位坐标 */
const afterEditCoord = ref<Coordinate2D>()

/** 抽屉不可见以后才清空点位信息缓存 */
const handleTransitionEnd = (ev: TransitionEvent) => {
  const isClose = ev.target === drawerRef.value && !drawerVisible.value && ev.propertyName === 'translate'
  if (!isClose)
    return
  cachedMarkerVo.value = null
}

const resetDrawerState = () => {
  afterEditCoord.value = undefined
  markerFormVisible.value = false
  cancel()
}

const activeLocationEditor = () => {
  if (!cachedMarkerVo.value)
    return
  const coord = (cachedMarkerVo.value.position?.split(',').map(Number) ?? [0, 0]) as Coordinate2D
  showCollimator(coord)
}

/** 抽屉关闭时重置状态 */
watch(drawerVisible, visible => !visible && resetDrawerState())

const icon = asyncComputed(() => {
  const iconTag = cachedMarkerVo.value?.itemList?.[0]?.iconTag ?? 'unknown'
  return db.iconTag.where('tag').equals(iconTag).first()
}, {})

const area = asyncComputed(async () => {
  const itemId = cachedMarkerVo.value?.itemList?.[0]?.itemId
  if (itemId === undefined)
    return
  const item = await db.item.get(itemId)
  if (!item)
    return
  const res = await db.area.get(item.areaId as number)
  return res
})

const parentArea = asyncComputed(() => {
  const parentId = area.value?.parentId
  if (parentId === undefined)
    return
  return db.area.get(parentId)
})

/** 点位是否已经完成 */
const isMarked = computed({
  get: () => {
    if (cachedMarkerVo.value?.id === undefined)
      return false
    return archiveStore.currentArchive.body.Data_KYJG.has(cachedMarkerVo.value?.id)
  },
  set: (v) => {
    if (cachedMarkerVo.value?.id === undefined)
      return
    archiveStore.currentArchive.body.Data_KYJG[v ? 'add' : 'delete'](cachedMarkerVo.value.id)
  },
})

const handleClickModal = (ev: MouseEvent) => {
  if (ev.composedPath().find(target => target === drawerRef.value))
    return
  !collimatorVisible.value && blur()
}

const markerCoord = computed(() => cachedMarkerVo.value?.position ? cachedMarkerVo.value.position.split(',').map(Number) as Coordinate2D : [0, 0])
</script>

<template>
  <div
    class="drawer-modal transition-all bg-black"
    :class="[
      (interactionLayerVisible && drawerVisible) ? 'pointer-events-auto' : '',
      (collimatorVisible || !drawerVisible) ? 'bg-opacity-0' : ' bg-opacity-40',
    ]"
    @click="handleClickModal"
  >
    <div
      ref="drawerRef"
      class="genshin-marker-drawer genshin-text"
      :class="{
        open: interactionLayerVisible && drawerVisible,
      }"
      @transitionend="handleTransitionEnd"
    >
      <template v-if="cachedMarkerVo">
        <div class="genshin-marker-drawer__wrapper">
          <div class="genshin-marker-drawer__header">
            <img v-if="icon" class="w-9 h-9 object-contain" crossorigin="" :src="icon.url">
            <div class="marker-title">
              <span class="text-xs">
                id: {{ cachedMarkerVo.id }}
              </span>
              <span class="text-xl leading-none">
                {{ cachedMarkerVo.markerTitle }}
              </span>
            </div>
            <div class="close-button w-9 h-9 p-0.5" @click="blur">
              <svg viewBox="0 0 100 100">
                <path fill="currentColor" d="m 0 0 l 34 5 l -7 7 l 23 23 l 23 -23 l -7 -7 l 34 -5 l -5 34 l -7 -7 l -23 23 l 23 23 l 7 -7 l 5 34 l -34 -5 l 7 -7 l -23 -23 l -23 23 l 7 7 l -34 5 l 5 -34 l 7 7 l 23 -23 l -23 -23 l -7 7 z" />
              </svg>
            </div>
          </div>

          <div class="genshin-marker-drawer__body">
            <img v-if="cachedMarkerVo.picture" class="w-full h-44 object-cover" :src="cachedMarkerVo.picture">

            <div class="marker-info">
              <div class="info-area flex items-center gap-2">
                <el-icon color="#676A74" :size="24">
                  <LocationFilled />
                </el-icon>
                {{ parentArea?.name }} - {{ area?.name }}
              </div>

              <div class="text-sm">
                <div>
                  X: {{ markerCoord[0] }}
                </div>
                <div>
                  Y: {{ markerCoord[1] }}
                </div>
              </div>

              <div class="flex-1 overflow-hidden">
                <el-scrollbar height="100%">
                  <p v-for="p in cachedMarkerVo.content?.trim().split('\n')" :key="p" style="min-height: 1.5em;">
                    {{ p }}
                  </p>
                </el-scrollbar>
              </div>

              <div class="flex items-center gap-2 py-2">
                <MarkerStateSwitch v-model="isMarked">
                  <div class="flex justify-center items-center p-1">
                    <el-icon class="rounded-full border border-red-500">
                      <component :is="isMarked ? Select : CloseBold" />
                    </el-icon>
                    <div class="flex-1">
                      {{ isMarked ? '已完成' : '未完成' }}
                    </div>
                  </div>
                </MarkerStateSwitch>
              </div>

              <div v-markeable class="flex items-center gap-4">
                <GSButton theme="dark" class="flex-1" @click="markerFormVisible = true">
                  <template #icon>
                    <el-icon color="#DAAF32">
                      <Edit />
                    </el-icon>
                  </template>
                  编辑
                </GSButton>
                <GSButton theme="dark" @click="activeLocationEditor">
                  <template #icon>
                    <el-icon color="#DAAF32">
                      <LocationFilled />
                    </el-icon>
                  </template>
                </GSButton>
                <GSButton theme="dark" class="flex-1">
                  <template #icon>
                    <el-icon color="var(--gs-color-danger)">
                      <DeleteFilled />
                    </el-icon>
                  </template>
                  删除
                </GSButton>
              </div>
            </div>
          </div>
        </div>

        <MarkerEditPanel v-if="area" v-model:visible="markerFormVisible" :marker-info="cachedMarkerVo" :init-area="area" />
      </template>

      <template v-else>
        你来到了没有知识的荒原
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.drawer-modal {
  position: absolute;
  width: 100%;
  height: 100%;
}

.genshin-marker-drawer {
  position: absolute;
  right: 0;
  width: 420px;
  height: 100%;
  translate: 100% 0%;
  transition: all ease 150ms;

  @media screen and (width < 420px) {
    width: 100%;
  }

  &.open {
    translate: 0% 0%;
  }

  .genshin-marker-drawer__wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #D9D3C8F4;
  }

  .genshin-marker-drawer__header {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
    padding: 16px;
    background: #3D4555;

    .marker-title {
      flex: 1;
      color: #D3BC8E;
      display: flex;
      align-items: flex-start;
      flex-direction: column;
    }

    .close-button {
      color: #EBE4D7;
      transition: all ease 150ms;
      mask: radial-gradient(#FFF 68%, #FFFFFFE0);
      cursor: pointer;
      &:hover {
        opacity: 0.9;
      }
      &:active {
        opacity: 0.5;
      }
    }
  }

  .genshin-marker-drawer__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;

    .marker-info {
      --border-width: 2px;

      flex: 1;
      padding: 1rem;
      display: flex;
      gap: 8px;
      flex-direction: column;
      position: relative;
      color: #686D7A;
      font-size: 20px;
      overflow: hidden;

      &::before {
        position: absolute;
        content: '';
        border: var(--border-width) solid #3D455520;
        left: var(--border-width);
        top: var(--border-width);
        width: calc(100% - 2 * var(--border-width));
        height: calc(100% - 2 * var(--border-width));
        pointer-events: none;
      }
    }

    .info-area {
      background: #D6C7AB;
      padding: 4px 8px;
    }
  }
}
</style>
