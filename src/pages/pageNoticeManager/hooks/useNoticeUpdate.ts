import { ElMessage } from 'element-plus'
import { useFetchHook } from '@/hooks'
import Api from '@/api/api'

export const useNoticeUpdate = () => {
  const { refresh: updateNotice, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async (notice: API.NoticeVo) => {
      await Api.notice.updateNotice(notice)
    },
  })

  onSuccess(() => {
    ElMessage.success({
      message: '编辑公告成功',
      offset: 48,
    })
  })

  onError((err) => {
    ElMessage.error({
      message: `编辑公告失败，原因为：${err.message}`,
      offset: 48,
    })
  })

  return {
    updateNotice,
    ...rest,
  }
}
