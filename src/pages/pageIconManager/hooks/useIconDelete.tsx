import { ElMessage, ElMessageBox } from 'element-plus'
import { useFetchHook } from '@/hooks'
import Api from '@/api/api'
import db from '@/database'

export function useIconDelete() {
  const { refresh: submitDeleteIcon, loading, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async (tag: API.TagVo) => {
      await Api.tag.deleteTag({ tagName: tag.tag! })
      await db.iconTag.delete(tag.tag!)
    },
  })

  const confirmDeleteIcon = async (tag: API.TagVo) => ElMessageBox.confirm(
    <span>该操作不可恢复，确认删除图标<span class="text-orange-400">{tag.tag}</span>？
    </span>,
    '警告',
    {
      confirmButtonClass: 'el-button--danger',
      beforeClose: async (action, instance, done) => {
        if (loading.value)
          return
        if (action !== 'confirm')
          return done()
        instance.confirmButtonLoading = true
        instance.confirmButtonClass = 'el-button--danger is-loading'
        await submitDeleteIcon(tag)
        instance.confirmButtonLoading = false
        done()
      },
    },
  )
    .catch(() => false)

  onSuccess(() => ElMessage.success({
    message: '删除成功',
  }))

  onError(err => ElMessage.error({
    message: `删除图标失败，原因为：${err.message}`,
  }))

  return { confirmDeleteIcon, onSuccess, ...rest }
}
