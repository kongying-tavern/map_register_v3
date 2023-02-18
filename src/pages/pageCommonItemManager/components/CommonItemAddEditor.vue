<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { useCommonItemAdd, useItemById } from '../hooks'
import { useAreaList, useIconList } from '@/hooks'
import { GlobalDialogController } from '@/hooks/useGlobalDialog'

const emits = defineEmits<{
  (e: 'success'): void
}>()

const { areaMap } = useAreaList({
  immediate: true,
})

const { iconMap } = useIconList({
  immediate: true,
})

const itemIdList = ref<number[]>([])

const itemIdInput = ref<number | null>()

const { itemList, loading: tempItemLoading, updateItemList, onSuccess: getItemListSuccess, onError: getItemListError } = useItemById({
  immediate: true,
  params: () => itemIdList.value,
})

const add2List = () => {
  /**
   *  !TODO 添加form校检
   */
  if (itemIdInput.value === undefined || itemIdInput.value == null || typeof itemIdInput.value !== 'number') {
    ElMessage.error('物品ID不正确')
    return
  }
  if (itemIdList.value.includes(itemIdInput.value)) {
    ElMessage.info('物品已添加')
    return
  }

  itemIdList.value.push(itemIdInput.value as number)
  itemIdInput.value = null
  updateItemList()
}

getItemListSuccess(() => {
  if (itemIdList.value.length > itemList.value.length && (itemIdList.value.length - itemList.value.length) === 1) {
    itemIdList.value.pop()
    ElMessage.error('物品ID不存在')
  }
  else if (itemIdList.value.length !== itemList.value.length) {
    itemIdList.value = []
    updateItemList()
    ElMessage.error('出现问题，已清空列表')
  }
})

getItemListError(() => {
  itemIdList.value = []
  updateItemList()
  ElMessage.error('出现问题，已清空列表')
})

const removeFromItemList = (row: API.ItemVo[]) => {
  itemIdList.value.splice(itemIdList.value.indexOf(row[0].itemId as number), 1)
  updateItemList()
}

const addCommonItem = () => {
  const { onSuccess, refresh } = useCommonItemAdd({
    params: () => itemIdList.value,
  })

  onSuccess(() => {
    itemIdList.value = []
    emits('success')
    ElMessage.success('新增成功')
    GlobalDialogController.close()
  })

  return refresh
}

const confirm = addCommonItem()

const onSubmit = async () => {
  if (itemIdList.value.length !== 0) {
    GlobalDialogController.updateBtnProps('submit', { props: { loading: true } })
    await confirm()
  }
  else {
    ElMessage.error('未添加物品')
  }
}

GlobalDialogController.registerBtn('cancel', {
  text: '取消',
  onClick: () => GlobalDialogController.close(),
})
GlobalDialogController.registerBtn('submit', {
  props: { type: 'primary' },
  text: '确认',
  onClick: () => onSubmit(),
})
</script>

<template>
  <div class="p-4 flex flex-col gap-5" label-width="60px">
    <div ref="containerRef" v-loading="tempItemLoading" class="flex-1 overflow-hidden">
      <el-table
        :data="itemList"
        stripe
        height="300"
      >
        <el-table-column label="物品ID" prop="itemId" width="90" fixed />
        <el-table-column label="图标" width="57">
          <template #default="{ row }">
            <img
              class="w-8 h-8 object-contain rounded-full bg-slate-700"
              :src="iconMap[row.iconTag ?? '']"
              referrerpolicy="no-referrer"
            >
          </template>
        </el-table-column>
        <el-table-column label="名称" prop="name" width="auto" />
        <el-table-column label="地区" width="200">
          <template #default="{ row }">
            <div>{{ areaMap[row.areaId]?.name ?? row.areaId }}</div>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="73">
          <template #default="{ row }">
            <el-button
              type="danger"
              plain
              size="small"
              @click="() => { removeFromItemList([row]) }"
            >
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-form @submit.prevent>
      <el-row type="flex" justify="center" :gutter="15">
        <el-col :span="14">
          <el-form-item
            label="物品ID"
            prop="itemid"
          >
            <el-input
              v-model.number="itemIdInput"
              autocomplete="off"
              clearable
              @keyup.enter="add2List"
            />
          </el-form-item>
          <!-- TODO 添加form校检 -->
          <!-- <el-form-item
            label="物品ID"
            prop="itemid"
            :rules="[
              { required: true, message: '请输入物品ID', trigger: 'blur' },
              { type: 'number', message: '物品ID应为数字', trigger: 'change' },
              { min: 1, max: 7, message: 'Length should be 3 to 5', trigger: 'blur' },
            ]"
          >
            <el-input
              v-model.number="itemIdInput"
              autocomplete="off"
              clearable
              @keyup.enter="add2List"
            />
          </el-form-item> -->
        </el-col>
        <el-col :span="4">
          <el-form-item>
            <el-button
              type="primary"
              @click="add2List"
            >
              添加
            </el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>
