<script lang="ts" setup>
import { GSButton } from '@/components'
import { useMarkerDrawer } from '@/pages/pageMapV2/hooks'
import db from '@/database'

const { focus, blur } = useMarkerDrawer()

const containerRef = ref<HTMLElement>()
onClickOutside(containerRef, blur)

const icon = asyncComputed(() => {
  const iconTag = focus.value?.itemList?.[0]?.iconTag ?? 'unknown'
  return db.iconTag.where('tag').equals(iconTag).first()
}, {})

const area = asyncComputed(async () => {
  const itemId = focus.value?.itemList?.[0]?.itemId ?? -9999
  const item = await db.item.get(itemId)
  if (!item)
    return {}
  return await db.area.get(item.areaId as number)
}, {})

const parentArea = asyncComputed(() => {
  const parentId = area.value?.parentId ?? -9999
  return db.area.get(parentId)
}, {})

const { width } = useWindowSize()
</script>

<template>
  <el-drawer
    v-if="focus"
    :model-value="Boolean(focus)"
    :title="`点位：${focus?.markerTitle}`"
    :size="width < 420 ? width : 420"
    :modal="false"
    :with-header="false"
    append-to-body
    class="genshin-marker-drawer genshin-text"
    @close="blur"
  >
    <div ref="containerRef" class="genshin-marker-drawer__wrapper">
      <div class="genshin-marker-drawer__header">
        <div class="marker-title">
          <img v-if="icon" class="w-8 h-8 object-contain" crossorigin="" :src="icon.url">
          {{ focus.markerTitle }}
        </div>
        <div class="close-button" @click="blur">
          <svg viewBox="0 0 100 100">
            <path fill="currentColor" d="m 0 0 l 34 5 l -7 7 l 23 23 l 23 -23 l -7 -7 l 34 -5 l -5 34 l -7 -7 l -23 23 l 23 23 l 7 -7 l 5 34 l -34 -5 l 7 -7 l -23 -23 l -23 23 l 7 7 l -34 5 l 5 -34 l 7 7 l 23 -23 l -23 -23 l -7 7 z" />
          </svg>
        </div>
      </div>

      <div class="genshin-marker-drawer__body">
        <img v-if="focus.picture" class="w-full h-44 object-cover" :src="focus.picture">

        <div class="marker-info">
          <div class="info-area flex items-center gap-2">
            <el-icon color="#676A74" :size="24">
              <LocationFilled />
            </el-icon>
            {{ parentArea?.name }} - {{ area?.name }}
          </div>

          <div class="flex-1">
            <p v-for="p in focus.content?.split('\n')" :key="p">
              {{ p }}
            </p>
          </div>

          <div class="flex items-center gap-4">
            <GSButton dark class="flex-1">
              <template #icon>
                <el-icon color="#DAAF32">
                  <Edit />
                </el-icon>
              </template>
              编辑
            </GSButton>
            <GSButton dark class="flex-1">
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
  </el-drawer>
</template>

<style lang="scss">
.el-drawer.genshin-marker-drawer {
  transition: all ease 150ms;
  background: transparent;

  &.rtl {
    top: var(--gs-banner-height);
    height: calc(100% - var(--gs-banner-height));
  }

  .el-drawer__body {
    padding: 0;
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
    justify-content: flex-end;
    padding: 16px;
    background: #3D4555;

    .marker-title {
      flex: 1;
      color: #D3BC8E;
      font-size: 24px;
      line-height: 1;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .close-button {
      width: 32px;
      height: 32px;
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
