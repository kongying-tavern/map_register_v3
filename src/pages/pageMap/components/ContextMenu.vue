<script lang="ts" setup>
import { ElMessage } from 'element-plus'

const props = defineProps<{
  target: HTMLElement | null
}>()

// 右键菜单
const { x, y } = useMouse()

const contextmenuVisible = ref(false)
const activePos = ref({
  x: 0,
  y: 0,
})

const contextTarget = toRef(props, 'target')
const contextmenuRef = ref<HTMLElement | null>(null)

useEventListener(contextTarget, 'contextmenu', (ev) => {
  ev.preventDefault()
  contextmenuVisible.value = true
  activePos.value = {
    x: x.value + 16,
    y: y.value + 16,
  }
})

useEventListener('pointerdown', (ev) => {
  if (!ev.composedPath().find(el => (el as HTMLElement) === contextmenuRef.value))
    contextmenuVisible.value = false
})

const onCommand = (ev: Event) => {
  const triggerItem = ev
    .composedPath()
    .find(el => (el as HTMLElement).dataset?.command) as HTMLElement | undefined
  if (!triggerItem)
    return
  contextmenuVisible.value = false
  ElMessage.info(`右键菜单开发中: ${triggerItem.dataset.command}`)
}
</script>

<template>
  <Transition name="fade">
    <div
      v-if="contextmenuVisible"
      ref="contextmenuRef"
      class="context-menu rounded-md bg-stone-800 bg-opacity-70 fixed left-0 top-0 p-1 grid grid-cols-2 gap-1 text-white shadow-xl"
      :style="{
        '--x': `${activePos.x}px`,
        '--y': `${activePos.y}px`,
      }"
      @click="onCommand"
    >
      <div data-command="Add" class="context-menu-item rounded hover:bg-stone-600 active:bg-stone-500 bg-opacity-70">
        <el-icon><Plus /></el-icon>
        <div>新增点位</div>
      </div>
      <div data-command="Edit" class="context-menu-item rounded hover:bg-stone-600 active:bg-stone-500 bg-opacity-70">
        <el-icon><Edit /></el-icon>
        <div>编辑点位</div>
      </div>
      <div data-command="Refresh" class="context-menu-item rounded hover:bg-stone-600 active:bg-stone-500 bg-opacity-70">
        <el-icon><Refresh /></el-icon>
        <div>刷新点位</div>
      </div>
      <div data-command="Setting" class="context-menu-item rounded hover:bg-stone-600 active:bg-stone-500 bg-opacity-70">
        <el-icon><Setting /></el-icon>
        <div>设置</div>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.context-menu {
  transform: translate(var(--x), var(--y));
  z-index: 900;
  font-size: 14px;
  backdrop-filter: blur(24px);

  &::before {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    left: 0;
    top: 0;
    transform: translate(-16px, -16px);
    pointer-events: none;
    border: solid red;
    border-width: 4px 0 0 4px;
  }
}

.context-menu-item {
  width: 80px;
  height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 4px;
  cursor: pointer;
  user-select: none;
  gap: 4px;
}
</style>
