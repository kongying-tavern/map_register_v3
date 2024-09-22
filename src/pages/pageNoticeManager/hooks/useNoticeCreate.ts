import { ElMessage } from 'element-plus'
import { useFetchHook } from '@/hooks'
import Api from '@/api/api'

export const useNoticeCreate = () => {
  const { refresh: createNotice, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async (notice: API.NoticeVo) => {
      await Api.notice.createNotice(notice)
    },
  })

  onSuccess(() => {
    ElMessage.success({
      message: '新增公告成功',
    })
  })

  onError((err) => {
    ElMessage.error({
      message: `新增公告失败，原因为：${err.message}`,
    })
  })

  return {
    createNotice,
    ...rest,
  }
}
