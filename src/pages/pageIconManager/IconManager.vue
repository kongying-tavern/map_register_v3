<script lang="ts" setup>
import { Close } from '@element-plus/icons-vue'
import { ElTree } from 'element-plus'
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import db from '@/database'
import type Node from 'element-plus/es/components/tree/src/model/node'
import Api from '@/api/api'
import { useFetchHook } from '@/hooks'

const activedIconTag = shallowRef<API.TagVo | null>(null)

const currentTypeId = ref(-1)
const { data: iconTagList, refresh: updateTagList, loading } = useFetchHook<API.TagVo[]>({
  initialValue: [],
  immediate: true,
  onRequest: async () => {
    const result = currentTypeId.value === -1
      ? await db.iconTag.toArray()
      : await db.iconTag.where('typeIdList').anyOf([currentTypeId.value]).toArray()
    return result
  },
})
const handleCurrentChange = (current: API.TagTypeVo) => {
  currentTypeId.value = current.id!
  activedIconTag.value = null
  updateTagList()
}

const tableContainerRef = ref<HTMLElement | null>(null)
const { width } = useElementSize(tableContainerRef)
const gridItems = computed(() => Math.floor((width.value - 32) / 100))

const loadTagType = async (node: Node, resolve: (data: API.TagTypeVo[]) => void) => {
  if (node.level === 0) {
    resolve([{ id: -1, name: '全部类型', isFinal: false }])
    return
  }
  const { data: { record = [] } = {} } = await Api.tagType.listTagType({
    typeIdList: [node.data.id],
    size: 256,
  })
  resolve(record)
}
</script>

<template>
  <div class="icon-manager h-full overflow-hidden text-xs">
    <div class="h-full border-r-[1px] el-border-color overflow-auto">
      <el-tree
        lazy
        accordion
        node-key="id"
        highlight-current
        :current-node-key="-1"
        :default-expanded-keys="[-1]"
        :expand-on-click-node="false"
        :props="{
          label: 'name',
          isLeaf: 'isFinal',
        }"
        :load="loadTagType"
        @current-change="handleCurrentChange"
      />
    </div>

    <div
      ref="tableContainerRef"
      class="border-r-[1px] el-border-color h-full overflow-hidden"
      v-loading="loading"
      element-loading-text="正在处理..."
    >
      <RecycleScroller
        :items="iconTagList"
        :grid-items="gridItems"
        :item-size="100"
        :item-secondary-size="100"
        key-field="tag"
        class="h-full"
      >
        <template #default="{ item, index }">
          <div
            class="grid-item"
            :class="{
              'is-actived': item.tag === activedIconTag?.tag,
            }"
            @click="activedIconTag = item"
          >
            <div class="flex-1 grid place-items-center">
              <el-image
                :src="item.url"
                crossorigin=""
                lazy
                class="w-8 h-8"
                fit="contain"
                preview-teleported
                :preview-src-list="[item.url]"
                :initial-index="index"
              >
                <template #error>
                  <el-icon :size="32" color="var(--el-color-danger)">
                    <Close />
                  </el-icon>
                </template>
              </el-image>
            </div>
            <div class="w-full overflow-hidden whitespace-nowrap text-ellipsis text-center">
              {{ item.tag }}
            </div>
          </div>
        </template>
      </RecycleScroller>
    </div>

    <div class="h-full overflow-hidden">
      <pre>{{ activedIconTag }}</pre>
    </div>

    <div class="border-t-[1px] el-border-color col-span-3 p-1">
      {{ iconTagList.length }} 个项目
    </div>
  </div>
</template>

<style lang="scss" scoped>
.el-border-color {
  border-color: var(--el-border-color-light);
}

.icon-manager {
  display: grid;
  grid-template-columns: 200px 1fr 300px;
  grid-template-rows: 1fr auto;
}

.grid-item {
  --bg-color: transparent;

  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
  border-radius: 8px;
  padding: 8px;
  background-color: var(--bg-color);
  clip-path: inset(2px 2px round 8px);

  &.is-actived {
    --bg-color: var(--el-color-primary-light-7);
  }

  &:not(.is-actived):hover {
    --bg-color: var(--el-color-primary-light-5);
  }
}
</style>