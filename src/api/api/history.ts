import { request } from '@/utils';

/** 回滚记录 回滚记录 POST /history/rollback */
export async function rollback(
  params: {
    // query
    id: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.RBoolean>(`/api/history/rollback`, {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 历史记录分页 历史记录分页 POST /history/get/list */
export async function getList(
  body: API.HistorySearchVo,
  options?: { [key: string]: any },
) {
  return request<API.RPageListVoHistoryVo>(`/api/history/get/list`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
