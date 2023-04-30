import { request } from '@/utils';

/** 添加物品类型 成功后返回新的类型ID PUT /api/item_type/add */
export async function addItemType(
  body: API.ItemTypeVo,
  options?: { [key: string]: any },
) {
  return request<API.RLong>('/api/item_type/add', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 修改物品类型 修改物品类型 POST /api/item_type/update */
export async function updateItemType(
  body: API.ItemTypeVo,
  options?: { [key: string]: any },
) {
  return request<API.RBoolean>('/api/item_type/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 批量移动类型为目标类型的子类型 将类型批量移动到某个类型下作为其子类型 POST /api/item_type/move/${param0} */
export async function moveItemType(
  params: {
    // path
    targetTypeId: number;
  },
  body: number[],
  options?: { [key: string]: any },
) {
  const { targetTypeId: param0, ...queryParams } = params;
  return request<API.RBoolean>(`/api/item_type/move/${param0}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 列出所有物品类型 返回所有可访问的物品类型 POST /api/item_type/get/list_all */
export async function listItemType(
  params: {
    // header
},
  options?: { [key: string]: any },
) {
  return request<API.RListItemTypeVo>('/api/item_type/get/list_all', {
    method: 'POST',
    headers: {},
    params: { ...params },
    ...(options || {}),
  });
}

/** 列出物品类型 不递归遍历，只遍历子级；{self}表示查询自身还是查询子级，0为查询自身，1为查询子级 POST /api/item_type/get/list/${param0} */
export async function listItemType1(
  params: {
    // header
// path
    self: number;
  },
  body: API.PageAndTypeSearchVo,
  options?: { [key: string]: any },
) {
  const { self: param0, ...queryParams } = params;
  return request<API.RPageListVoItemTypeVo>(`/api/item_type/get/list/${param0}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 删除物品类型 批量递归删除物品类型，需在前端做二次确认 DELETE /api/item_type/delete/${param0} */
export async function deleteItemType(
  params: {
    // path
    itemTypeId: number;
  },
  options?: { [key: string]: any },
) {
  const { itemTypeId: param0, ...queryParams } = params;
  return request<API.RBoolean>(`/api/item_type/delete/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}
