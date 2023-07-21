import { ElMessage, ElMessageBox } from 'element-plus'
import { useFetchHook } from '@/hooks'
import Api from '@/api/api'

export const useIconTagDelete = () => {
  const { refresh: submitDeleteTag, loading, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async (tags: API.TagVo | API.TagVo[]) => {
      const mission = Array.isArray(tags)
        ? Promise.allSettled(tags.map(tag => Api.tag.deleteTag({ tagName: tag.tag! })))
        : Api.tag.deleteTag({ tagName: tags.tag! })
      await mission
    },
  })

  const confirmDeleteTag = async (tags: API.TagVo | API.TagVo[]) => ElMessageBox.confirm(
    Array.isArray(tags)
      ? <div>
        <div>将删除以下 {tags.length} 个标签：</div>
        {tags.map((tag, index) => <div>&emsp;{index + 1}. <span style="color: #FB923C">{tag.tag} (id: {tag.id})</span></div>)}
        <div>该操作不可逆，请确认？</div>
      </div>
      : <div>将删除标签<span style="color: #FB923C">{tags.tag} (id: {tags.id})</span>，该操作不可逆，请确认？</div>,
    '警告',
    {
      confirmButtonClass: 'el-button--danger',
      beforeClose: async (action, instance, done) => {
        if (loading.value)
          return
        if (action !== 'confirm')
          return done()
        instance.confirmButtonLoading = true
        await submitDeleteTag(tags)
        instance.confirmButtonLoading = false
        done()
      },
    }).catch(() => false)

  onSuccess(() => ElMessage.success({
    message: '删除成功',
    offset: 48,
  }))

  onError(err => ElMessage.error({
    message: `删除标签失败，原因为：${err.message}`,
    offset: 48,
  }))

  return { confirmDeleteTag, onSuccess, ...rest }
}
