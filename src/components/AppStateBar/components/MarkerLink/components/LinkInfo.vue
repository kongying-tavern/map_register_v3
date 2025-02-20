<script setup lang="ts">
import { Delete, EditPen, RefreshLeft } from '@element-plus/icons-vue'
import type { ModifyLinkOptions } from '..'
import LinkMarkerInfo from './LinkMarkerInfo.vue'
import type { LinkActionEnum } from '@/shared'
import { LINK_ACTION_NAME_MAP, LINK_CONFIG_MAP } from '@/shared'

const props = defineProps<{
  linkKey: string
  linkOption: ModifyLinkOptions
  editable?: boolean
}>()

defineEmits<{
  delete: []
  extract: []
  revest: []
}>()

const hoverKey = defineModel<string>('hoverKey', {
  required: false,
  default: '',
})

const enter = () => {
  hoverKey.value = props.linkOption.key
}

const exit = () => {
  hoverKey.value = ''
}

const color = computed(() => {
  const { linkAction } = props.linkOption.raw
  if (!linkAction)
    return 'black'
  const colorNums = LINK_CONFIG_MAP.get(linkAction as LinkActionEnum)?.lineColor
  if (!colorNums)
    return 'black'
  return `rgba(${colorNums.join(' ')})`
})
</script>

<template>
  <div
    class="
      link-info
      w-full overflow-hidden grid items-center px-1 rounded
      text-xs leading-5 select-none
    "
    :class="[
      editable ? 'grid-cols-[1fr_auto_1fr_auto]' : 'grid-cols-[1fr_auto_1fr]',
      {
        'is-hover': linkOption.key === hoverKey,
        'is-delete': linkOption.isDelete,
      },
    ]"
    @pointerenter="enter"
    @pointerleave="exit"
  >
    <LinkMarkerInfo :marker-id="linkOption.raw.fromId" />

    <div
      class="w-[60px] h-[32px] flex flex-col justify-center items-center rounded"
      :style="`color:${color}`"
    >
      <div
        class="leading-none"
        style="-webkit-text-stroke: 3px white; paint-order: stroke"
      >
        {{ linkOption.raw.linkAction ? LINK_ACTION_NAME_MAP.get(linkOption.raw.linkAction as LinkActionEnum) ?? '未知' : '无' }}
      </div>

      <div
        class="leading-none"
        style="-webkit-text-stroke: 3px white; paint-order: stroke"
      >
        →
      </div>
    </div>

    <LinkMarkerInfo :marker-id="linkOption.raw.toId" reverse />

    <div v-if="editable" class="h-10 my-1 ml-1">
      <div
        v-if="linkOption.isMerge"
        class="interaction-button bg-[var(--el-color-info-light-7)]"
        title="此项关联来自自动合并，点击以进行编辑"
        @click="() => $emit('extract')"
      >
        <el-icon :size="12" color="var(--el-color-info)">
          <EditPen />
        </el-icon>
      </div>

      <div
        v-else-if="!linkOption.isDelete"
        class="interaction-button bg-[var(--el-color-danger-light-7)]"
        title="点击以进行删除"
        @click="() => $emit('delete')"
      >
        <el-icon :size="12" color="var(--el-color-danger)">
          <Delete />
        </el-icon>
      </div>

      <div
        v-else
        class="interaction-button bg-[var(--el-color-warning-light-7)]"
        title="此项关联来自自动合并且已删除，点击以进行恢复"
        @click="() => $emit('revest')"
      >
        <el-icon :size="12" color="var(--el-color-warning)">
          <RefreshLeft />
        </el-icon>
      </div>
    </div>
  </div>
</template>

<style scoped>
.link-info {
  --hover-color: transparent;

  @apply relative;

  &.is-delete {
    opacity: 0.5;
  }

  &.is-hover, &:hover {
    --hover-color: color-mix(in srgb, var(--el-color-primary) 20%, transparent 80%);
  }

  &::before {
    content: '';
    position: absolute;
    pointer-events: none;
    border-radius: 4px;
    top: 4px;
    left: 4px;
    width: calc(100% - 8px);
    height: calc(100% - 8px);
    background-color: var(--hover-color);
  }
}

.interaction-button {
  @apply
    h-full px-1 grid place-items-center rounded-sm
    hover:brightness-110
    active:brightness-90
    cursor-pointer
  ;
}
</style>
