<script lang="ts" setup>
import { ElTree } from 'element-plus'
import type Node from 'element-plus/es/components/tree/src/model/node'
import { IconExplorer } from './components'
import db from '@/database'
import Api from '@/api/api'
import { useFetchHook } from '@/hooks'

const activedTag = shallowRef<API.TagVo | null>(null)
const currentTypeId = ref(-1)

const { data: tagList, refresh: updateTagList, loading } = useFetchHook<API.TagVo[]>({
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
  activedTag.value = null
  updateTagList()
}

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
    <div class="col-span-3">
      header
    </div>

    <div class="h-full border-r-[1px] el-border-color overflow-auto">
      <ElTree
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

    <IconExplorer
      v-model:actived-tag="activedTag"
      :loading="loading"
      :tag-type-id="currentTypeId"
      :tag-list="tagList"
    />

    <div class="h-full overflow-hidden">
      <pre>{{ activedTag }}</pre>
    </div>

    <div class="border-t-[1px] el-border-color col-span-3 p-1">
      {{ tagList.length }} 个项目
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
  grid-template-rows: auto 1fr auto;
}
</style>
