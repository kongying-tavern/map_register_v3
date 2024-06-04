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
      offset: 48,
    })
  })

  onError((err) => {
    ElMessage.error({
      message: `新增公告失败，原因为：${err.message}`,
      offset: 48,
    })
  })

  return {
    createNotice,
    ...rest,
  }
}
