<script setup lang="ts">
import { cloneDeep, isEqual } from 'lodash'
import type Node from 'element-plus/es/components/tree/src/model/node'
import { Check, Delete } from '@element-plus/icons-vue'
import { useIconTagStore } from '@/stores'
import Api from '@/api/api'
import type { ItemFormRules } from '@/utils'

const iconTagStore = useIconTagStore()

const iconTag = defineModel<API.TagVo | null>('modelValue', {
  default: null,
})

const form = ref(cloneDeep(iconTag.value ?? {}))

watch(() => iconTag.value, () => {
  form.value = cloneDeep(iconTag.value ?? {})
})

const isFormChange = computed(() => isEqual(iconTag.value, form.value))

const rules: ItemFormRules<API.TagVo> = {
  tag: [{ required: true, message: '名称不能为空', validator: (_, v = '') => v.trim().length > 0, trigger: 'change' }],
}

const loadTagType = async (node: Node, resolve: (data: API.TagTypeVo[]) => void) => {
  const { data: { record = [] } = {} } = await Api.tagType.listTagType({
    typeIdList: [node.level === 0 ? -1 : node.data.id],
    size: 256,
  })
  resolve(record)
}
</script>

<template>
  <div class="icon-previewer h-full">
    <div v-if="!iconTag" class="w-64 h-full grid place-items-center">
      选择要预览的图标
    </div>

    <div v-else class="w-64 h-full overflow-auto flex flex-col">
      <div
        class="icon-image h-64 grid place-items-center overflow-hidden flex-shrink-0"
        :style="{
          '--bg': `url(${iconTagStore.tagSpriteImage})`,
          '--x': `${-iconTagStore.iconMapping[iconTag.tag!][0]}px`,
          '--y': `${-iconTagStore.iconMapping[iconTag.tag!][1]}px`,
        }"
      >
        <div class="image-box w-16 h-16" />
      </div>

      <div class="icon-detail flex-1 px-4">
        <el-form label-width="52px" :rules="rules" :model="form">
          <el-form-item label="名称" prop="tag">
            <el-input v-model="form.tag" />
          </el-form-item>

          <el-form-item label="分类" prop="typeIdList">
            <el-tree-select
              v-model="form.typeIdList"
              style="width: 100%"
              node-key="id"
              clearable multiple collapse-tags collapse-tags-tooltip
              lazy accordion highlight-current show-checkbox check-strictly check-on-click-node
              :current-node-key="-1"
              :default-expanded-keys="[-1]"
              :expand-on-click-node="false"
              :props="{
                label: 'name',
                value: 'id',
                isLeaf: 'isFinal',
              }"
              :load="loadTagType"
            />
          </el-form-item>

          <el-form-item label-width="0px" class="flex">
            <el-button :disabled="isFormChange" :icon="Check" class="flex-1">
              保存
            </el-button>
            <el-button :icon="Delete" type="danger" plain />
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.icon-previewer {
  overflow: hidden;
}

.icon-image {
  --s: 32px;

  --color-a: var(--el-fill-color-darker);
  --color-b: transparent;

  border: 16px solid transparent;
  background: conic-gradient(
    from 0deg at 50% 50%,
    var(--color-a) 25%,
    var(--color-b) 25%,
    var(--color-b) 50%,
    var(--color-a) 50%,
    var(--color-a) 75%,
    var(--color-b) 75%,
    var(--color-b) 100%
  );
  background-size: var(--s) var(--s);
  background-clip: padding-box;
}

.image-box {
  background: var(--bg);
  background-position: var(--x) var(--y);
  scale: 2;
}
</style>
