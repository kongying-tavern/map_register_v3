import { ElMessage } from 'element-plus'
import { useFetchHook } from '@/hooks'
import Api from '@/api/api'

export const useNoticeDelete = () => {
  const { refresh: deleteNotice, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async (notice: API.NoticeVo) => {
      if (notice.id === undefined)
        throw new Error('公告 id 为空')

      await Api.notice.deleteNotice({ noticeId: notice.id! })

      return notice
    },
  })

  onSuccess(() => {
    ElMessage.success({
      message: '删除公告成功',
    })
  })

  onError((err) => {
    ElMessage.error({
      message: `删除公告失败，原因为：${err.message}`,
    })
  })

  return {
    deleteNotice,
    onSuccess,
    onError,
    ...rest,
  }
}
