import { request } from '@/utils';

/** 生成评分 生成评分数据 POST /api/score/generate */
export async function generate(
  params: {
    // header
},
  body: API.ScoreParamsVo,
  options?: { [key: string]: any },
) {
  return request<API.RObject>('/api/score/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...params },
    data: body,
    ...(options || {}),
  });
}

/** 获取评分 获取评分数据 POST /api/score/data */
export async function getData(body: API.ScoreParamsVo, options?: { [key: string]: any }) {
  return request<API.RObject>('/api/score/data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
