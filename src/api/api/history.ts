import { request } from '@/utils';

/** 历史记录分页 历史记录分页 POST /api/history/get/list */
export async function getList(
  body: API.HistorySearchVo,
  options?: { [key: string]: any },
) {
  return request<API.RPageListVoHistoryVo>('/api/history/get/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
