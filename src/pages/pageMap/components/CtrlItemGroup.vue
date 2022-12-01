<script lang="ts" setup>
import { groupBy } from 'lodash'
import { useTypeList } from '@/hooks'

const props = withDefaults(defineProps<{
  modelValue?: string | string
  itemKeyName?: keyof API.ItemVo
  itemList: API.ItemVo[]
  iconMap: Record<string, string>
  loading: boolean
}>(), {
  itemKeyName: 'itemId',
})

const emits = defineEmits<{
  (e: 'update:modelValue', v?: string): void
}>()

const internalBind = computed({
  get: () => props.modelValue,
  set: v => emits('update:modelValue', v),
})

const proxySelect = (ev: MouseEvent) => {
  for (const ele of ev.composedPath()) {
    const itemKey = (ele as HTMLElement)?.dataset?.bindKey
    if (itemKey === undefined)
      continue
    internalBind.value = internalBind.value === itemKey ? undefined : itemKey
  }
}

const { typeList } = useTypeList()

const typeMap = computed(() => Object.fromEntries(typeList.value.map(tp => [tp.typeId as number, tp.name as string])))

const groupedItems = computed(() => groupBy(props.itemList, item => item.typeIdList?.[0] ?? -1))
</script>

<template>
  <div
    class="items-panel w-80 overflow-y-auto bg-gray-700 bg-opacity-70 rounded text-xs text-slate-300 p-1"
    @click="proxySelect"
  >
    <div v-for="(items, key) of groupedItems" :key="key" class="grid grid-cols-4 gap-1 content-start pb-2">
      <div class="item-group-label genshin-text col-span-4 p-2 flex items-center gap-2 text-sm">
        {{ typeMap[key] ?? key }}
      </div>
      <div
        v-for="item in items"
        :key="item.itemId"
        :data-bind-key="item[itemKeyName]"
        :class="{
          actived: internalBind === item[itemKeyName],
        }"
        class="item-selector rounded flex flex-col gap-1 items-center cursor-pointer"
      >
        <div class="w-14 h-14 rounded grid place-items-center bg-gray-800 overflow-hidden">
          <el-image
            :src="iconMap[item.iconTag ?? '']"
            :alt="item.name"
            :title="item.name"
            lazy
            class="w-4/5 h-4/5 bg-transparent"
            style="--el-fill-color-light: transparent"
            fit="contain"
            decoding="async"
            referrerpolicy="no-referrer"
          >
            <template #error>
              <img class="w-full h-full object-contain" src="https://assets.yuanshen.site/icons/-1.png">
            </template>
          </el-image>
        </div>
        <span class="w-full align-middle whitespace-nowrap overflow-hidden text-center text-ellipsis">{{ item.name }}</span>
      </div>
    </div>

    <div v-if="!loading" class="text-center py-4">
      没有更多物品了
    </div>
  </div>
</template>

<style lang="scss" scoped>
.items-panel {
  position: relative;
  scrollbar-width: 10px;

  &::-webkit-scrollbar {
    width: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #AA9172;
    border: 1px solid #2F3846;
    border-radius: 2px;
  }
  &::-webkit-scrollbar-track {
    background-color: #2F3846;
  }
}

.item-group-label {
  color: #d3bc8e;
  &::before {
    content: '';
    flex: 1;
    height: 1px;
    background-color: #d3bc8e;
  }
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: #d3bc8e;
  }
}

.item-selector {
  border: 1px solid transparent;
  transition: all ease 176ms;
  padding: 4px;
  width: 100%;
  content-visibility: auto;
  contain-intrinsic-size: 86px;

  &:hover {
    background-color: rgb(124, 124, 124, 0.5);
  }

  &:active {
    background-color: rgb(124, 124, 124, 0.7);
  }

  &.actived {
    background-color: rgba(55, 255, 82, 0.3);
    border-color: rgba(55, 255, 82, 0.6);
  }
}
</style>
