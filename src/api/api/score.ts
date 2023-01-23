import { request } from '@/utils';

/** 生成评分 生成评分数据 POST /score/generate */
export async function generate(
  params: {
    // header
},
  body: API.ScoreGenerateVo,
  options?: { [key: string]: any },
) {
  return request<API.RObject>(`/api/score/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...params },
    data: body,
    ...(options || {}),
  });
}
