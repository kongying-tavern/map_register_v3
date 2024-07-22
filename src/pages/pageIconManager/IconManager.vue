<script lang="ts" setup>
/**
 * @注意
 * 这个组件虽然名为 IconManager，但它主要管理的是 icon tag（图标标签）。
 *
 * 关于图标与标签的关系，可以理解为，Tag 是 Icon 的“快捷方式”。
 */
import { ElTree } from 'element-plus'
import type Node from 'element-plus/es/components/tree/src/model/node'
import { IconExplorer, IconExplorerHeader, IconPreviewer } from './components'
import db from '@/database'
import Api from '@/api/api'
import { useDatabaseHook, useFetchHook, useState } from '@/hooks'

const activedTag = shallowRef<API.TagVo | null>(null)
const [scrollTarget, setScrollTarget] = useState<API.TagVo | null>(null)

const queryTagName = ref('')
const queryTagType = ref<API.TagTypeVo>({
  id: -1,
  name: '全部类型',
})
const sortInfo = ref<Record<string, string>>({
  key: 'createTime',
  type: '-',
})

const tagSorter = (pre: API.TagVo, next: API.TagVo) => {
  const valueA = pre[sortInfo.value.key as keyof API.TagVo]
  const valueB = next[sortInfo.value.key as keyof API.TagVo]
  const isAscending = sortInfo.value.type === '+'

  if (valueA === undefined)
    return 0

  if (Array.isArray(valueA))
    return 0

  if (typeof valueA === 'number')
    return isAscending ? (valueA - (valueB as number)) : ((valueB as number) - valueA)

  if (typeof valueA === 'string') {
    // 时间戳
    if (sortInfo.value.key.endsWith('Time')) {
      const timeA = new Date(valueA).getTime()
      const timeB = new Date(valueB as string).getTime()
      return isAscending ? (timeA - timeB) : (timeB - timeA)
    }
    return isAscending
      ? valueA.localeCompare(valueB as string, undefined, { numeric: true, sensitivity: 'base' })
      : (valueB as string).localeCompare(valueA, undefined, { numeric: true, sensitivity: 'base' })
  }

  return 0
}

const { data: tagList, loading, refresh: updateTagList, onSuccess: onTagRefreshSuccess } = useFetchHook<API.TagVo[]>({
  initialValue: [],
  immediate: true,
  onRequest: async () => {
    let collection = queryTagType.value.id === -1
      ? db.iconTag.toCollection()
      : db.iconTag.where('typeIdList').anyOf([queryTagType.value.id!])

    const queryName = queryTagName.value.trim()
    if (queryName)
      collection = collection.and(tag => Boolean(tag.tag?.includes(queryName)))

    const result = await collection.toArray()
    return result.sort(tagSorter)
  },
})

watch([queryTagType, queryTagName, sortInfo], updateTagList, { deep: true })
useDatabaseHook(db.iconTag, updateTagList, ['creating', 'deleting', 'updating'])

const scrollMission = ref<API.TagVo | null>(null)
const setScrollTargetWhenUpdate = (tag: API.TagVo) => {
  if (loading.value) {
    scrollMission.value = tag
    return
  }
  setScrollTarget(tag)
}

onTagRefreshSuccess(async () => {
  // 用于在新建 tag 时滑动到对应的 tag 以提醒用户继续编辑图片
  if (scrollMission.value) {
    setScrollTarget(scrollMission.value)
    activedTag.value = scrollMission.value
    scrollMission.value = null
    return
  }
  // 用于在更新列表时更新对应的已选 tag 信息
  if (activedTag.value) {
    const res = await db.iconTag.get(activedTag.value.tag!) ?? null
    activedTag.value = res
  }
})

const handleCurrentChange = (tagType: API.TagTypeVo) => {
  queryTagType.value = tagType
  activedTag.value = null
  updateTagList()
}

async function loadTagType(node: Node, resolve: (data: API.TagTypeVo[]) => void) {
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
  <div class="icon-manager grid grid-cols-[200px_1fr_auto] grid-rows-[auto_1fr_auto] h-full overflow-hidden text-xs">
    <IconExplorerHeader
      v-model:query-tag-name="queryTagName"
      v-model:query-tag-type="queryTagType"
      v-model:sort-info="sortInfo"
      @create-tag-success="setScrollTargetWhenUpdate"
    />

    <div class="h-full border-r-[1px] border-[var(--el-border-color-lighter)] overflow-auto">
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
      v-model:scroll-target="scrollTarget"
      :loading="loading"
      :tag-list="tagList"
    />

    <IconPreviewer v-model="activedTag" :tag="activedTag" />

    <div class="border-t-[1px] border-[var(--el-border-color-lighter)] col-span-3 p-2 px-3">
      <el-text size="small">
        {{ tagList.length }} 个项目
        <template v-if="activedTag">
          <el-divider direction="vertical" />
          图标原始地址：
          <a :href="activedTag.url" class="hover:underline underline-offset-4" target="_blank" rel="noopener">
            {{ decodeURIComponent(activedTag.url ?? '') }}
          </a>
        </template>
      </el-text>
    </div>
  </div>
</template>
