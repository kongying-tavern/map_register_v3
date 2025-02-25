import Api from '@/api/api'
import { useFetchHook } from '@/hooks'
import { ElMessage } from 'element-plus'

export const useNoticeUpdate = () => {
  const { refresh: updateNotice, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async (notice: API.NoticeVo) => {
      await Api.notice.updateNotice(notice)
    },
  })

  onSuccess(() => {
    ElMessage.success({
      message: '编辑公告成功',
    })
  })

  onError((err) => {
    ElMessage.error({
      message: `编辑公告失败，原因为：${err.message}`,
    })
  })

  return {
    updateNotice,
    ...rest,
  }
}
