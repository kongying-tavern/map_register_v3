import { request } from '@/utils';

/** 新建存档槽位并将存档存入 新建存档并存入，注意槽位下标不能冲突 PUT /system/archive/${param0}/${param1} */
export async function createSlotAndSaveArchive(
  params: {
    // header
// path
    slot_index: number;
    name: string;
  },
  body: string,
  options?: { [key: string]: any },
) {
  const { slot_index: param0, name: param1, ...queryParams } = params;
  return request<API.RBoolean>(`/system/archive/${param0}/${param1}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 存档入指定槽位 指定槽位下标，将存档存入该槽位。如果存档与最后一次一致，则不存入，并返回false；如果槽位已满，则挤掉最后一次备份。 POST /system/archive/save/${param0} */
export async function saveArchive(
  params: {
    // header
// path
    slot_index: number;
  },
  body: string,
  options?: { [key: string]: any },
) {
  const { slot_index: param0, ...queryParams } = params;
  return request<API.RBoolean>(`/system/archive/save/${param0}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 重命名指定槽位 重命名槽位，后端会对槽位校验，更新失败返回false POST /system/archive/rename/${param0}/${param1} */
export async function renameSlot(
  params: {
    // header
// path
    slot_index: number;
    new_name: string;
  },
  options?: { [key: string]: any },
) {
  const { slot_index: param0, new_name: param1, ...queryParams } = params;
  return request<API.RBoolean>(`/system/archive/rename/${param0}/${param1}`, {
    method: 'POST',
    headers: {},
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 获取指定存档槽位的当前存档 获取指定存档槽位的当前存档，获取槽位最新存档（1号历史记录的存档） GET /system/archive/last/${param0} */
export async function getLastArchive(
  params: {
    // header
// path
    slot_index: number;
  },
  options?: { [key: string]: any },
) {
  const { slot_index: param0, ...queryParams } = params;
  return request<API.RSysArchiveVo>(`/system/archive/last/${param0}`, {
    method: 'GET',
    headers: {},
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 获取指定槽位的所有历史存档 获取指定槽位的所有历史存档 GET /system/archive/history/${param0} */
export async function getHistoryArchive(
  params: {
    // header
// path
    slot_index: number;
  },
  options?: { [key: string]: any },
) {
  const { slot_index: param0, ...queryParams } = params;
  return request<API.RSysArchiveSlotVo>(`/system/archive/history/${param0}`, {
    method: 'GET',
    headers: {},
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 获取所有槽位的历史存档 获取所有槽位的历史存档 GET /system/archive/all_history */
export async function getAllHistoryArchive(
  params: {
    // header
},
  options?: { [key: string]: any },
) {
  return request<API.RListSysArchiveSlotVo>('/system/archive/all_history', {
    method: 'GET',
    headers: {},
    params: { ...params },
    ...(options || {}),
  });
}

/** 删除存档槽位 将整个存档槽位删除 DELETE /system/archive/slot/${param0} */
export async function removeArchive(
  params: {
    // header
// path
    slot_index: number;
  },
  options?: { [key: string]: any },
) {
  const { slot_index: param0, ...queryParams } = params;
  return request<API.RBoolean>(`/system/archive/slot/${param0}`, {
    method: 'DELETE',
    headers: {},
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 删除最近一次存档（恢复为上次存档） 删除最近一次存档，也意味着恢复为上次存档。会返回上一次存档。如果存档为空，则返回400，并附带报错信息 DELETE /system/archive/restore/${param0} */
export async function restoreArchive(
  params: {
    // header
// path
    slot_index: number;
  },
  options?: { [key: string]: any },
) {
  const { slot_index: param0, ...queryParams } = params;
  return request<API.RSysArchiveVo>(`/system/archive/restore/${param0}`, {
    method: 'DELETE',
    headers: {},
    params: { ...queryParams },
    ...(options || {}),
  });
}
