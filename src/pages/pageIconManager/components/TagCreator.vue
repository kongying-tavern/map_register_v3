<script setup lang="ts">
import Api from '@/api/api'
import { GlobalDialogController, WinDialog, WinDialogFooter, WinDialogTabPanel, WinDialogTitleBar } from '@/components'
import db from '@/database'
import { useFetchHook } from '@/hooks'
import { useUserStore } from '@/stores'
import { Check, Close } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'

const emits = defineEmits<{
  success: [tag: API.TagVo]
}>()

const LENGTH_LIMIT = 16

const tagName = controlledRef('', {
  onBeforeChange: (value) => {
    const trimValue = value.trim()
    if (value !== trimValue)
      return false
    return trimValue.length >= 0 && trimValue.length <= LENGTH_LIMIT
  },
})

const userStore = useUserStore()

const { loading, refresh: createTag, onSuccess, onError } = useFetchHook({
  onRequest: async () => {
    if (!userStore.info)
      throw new Error('未登录')

    const name = toValue(tagName)
    const { data = false } = await Api.tag.createTag({ tagName: name })

    // 如果 data 为 false，说明已经存在同名 tag，直接查询该 tag 信息返回
    if (!data) {
      const { data = {} } = await Api.tag.getTag({ name })
      return data
    }

    // TODO 目前 tag 添加后需要等待缓存刷新才能查询到更新，这里将添加后的信息先更新到本地数据库
    // 可能导致的问题：初始化信息的行为与后端不一致

    const current = dayjs().format('YYYY-MM-DD HH:mm:ss')

    const createdTag = {
      tag: name,
      iconId: 0,
      url: '',
      creatorId: userStore.info.id,
      createTime: current,
      updaterId: userStore.info.id,
      updateTime: current,
      typeIdList: [],
      version: 1,
    }
    await db.iconTag.put(createdTag)

    return createdTag
  },
})

onSuccess((tag) => {
  ElMessage.success({
    message: '新建图标成功',
  })
  emits('success', tag)
  GlobalDialogController.close()
})

onError((err) => {
  ElMessage.error({
    message: `新建图标失败，原因为：${err.message}`,
  })
})

const cancel = () => {
  if (loading.value)
    return
  GlobalDialogController.close()
}

const tabs: { key: string, name: string }[] = [
  { key: 'base', name: '基本信息' },
]
const activedTabKey = ref('base')
</script>

<template>
  <WinDialog>
    <WinDialogTitleBar
      :disabled="loading"
      @close="cancel"
    >
      新建图标
    </WinDialogTitleBar>

    <WinDialogTabPanel
      v-model:tab-key="activedTabKey"
      :tabs="tabs"
      :tabs-disabled="loading"
      class="w-[370px]"
    >
      <el-input v-model="tagName" class="col-span-2" placeholder="请输入图标名称">
        <template #prefix>
          <span class="text-xs text-[var(--el-color-danger)] select-none">
            *
          </span>
        </template>
        <template #suffix>
          <span class="text-xs select-none" :class="!tagName.length ? 'text-[var(--el-color-danger)]' : ''">
            {{ tagName.length }} / {{ LENGTH_LIMIT }}
          </span>
        </template>
      </el-input>
    </WinDialogTabPanel>

    <WinDialogFooter>
      <el-button
        type="primary"
        :icon="Check"
        :loading="loading"
        :disabled="tagName.length === 0"
        @click="createTag"
      >
        确认
      </el-button>
      <el-button
        :icon="Close"
        :disabled="loading"
        @click="cancel"
      >
        取消
      </el-button>
    </WinDialogFooter>
  </WinDialog>
</template>
