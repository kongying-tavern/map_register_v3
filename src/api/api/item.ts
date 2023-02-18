import { request } from '@/utils';

/** 复制物品到地区 此操作估计会占用较长时间，根据物品ID列表复制物品到新地区，此操作会递归复制类型及父级类型。会返回新的物品列表与新的类型列表，用于反映新的ID PUT /api/item/copy/${param0} */
export async function copyItemToArea(
  params: {
    // path
    areaId: number;
  },
  body: number[],
  options?: { [key: string]: any },
) {
  const { areaId: param0, ...queryParams } = params;
  return request<API.RListLong>(`/api/item/copy/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 新增物品 新建成功后会返回新物品ID PUT /api/item/add */
export async function createItem(body: API.ItemVo, options?: { [key: string]: any }) {
  return request<API.RLong>('/api/item/add', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 修改物品 提供修改同名物品功能，默认关闭 POST /api/item/update/${param0} */
export async function updateItem(
  params: {
    // path
    editSame: number;
  },
  body: API.ItemVo[],
  options?: { [key: string]: any },
) {
  const { editSame: param0, ...queryParams } = params;
  return request<API.RBoolean>(`/api/item/update/${param0}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 将物品加入某一类型 根据物品ID列表批量加入，在加入多类型时需要注意类型的地区需一致，不一致会直接报错 POST /api/item/join/${param0} */
export async function joinItemsInType(
  params: {
    // path
    typeId: number;
  },
  body: number[],
  options?: { [key: string]: any },
) {
  const { typeId: param0, ...queryParams } = params;
  return request<API.RBoolean>(`/api/item/join/${param0}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 根据筛选条件列出物品信息 传入的物品类型ID和地区ID列表，必须为末端的类型或地区 POST /api/item/get/list */
export async function listItemIdByType(
  params: {
    // header
},
  body: API.ItemSearchVo,
  options?: { [key: string]: any },
) {
  return request<API.RPageListVoItemVo>('/api/item/get/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...params },
    data: body,
    ...(options || {}),
  });
}

/** 根据物品ID查询物品 输入ID列表查询，单个查询也用此API POST /api/item/get/list_byid */
export async function listItemById(
  params: {
    // header
},
  body: number[],
  options?: { [key: string]: any },
) {
  return request<API.RListItemVo>('/api/item/get/list_byid', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...params },
    data: body,
    ...(options || {}),
  });
}

/** 删除物品 根据物品ID列表批量删除物品 DELETE /api/item/delete/${param0} */
export async function deleteItem(
  params: {
    // path
    itemId: number;
  },
  options?: { [key: string]: any },
) {
  const { itemId: param0, ...queryParams } = params;
  return request<API.RBoolean>(`/api/item/delete/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}
