import { request } from '@/utils';

/** 新增物品 新建成功后会返回新物品ID PUT /item */
export async function createItem(body: API.ItemVo, options?: { [key: string]: any }) {
  return request<API.RLong>(`/api/item`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 添加物品类型 成功后返回新的类型ID PUT /item/type */
export async function addItemType(
  body: API.ItemTypeVo,
  options?: { [key: string]: any },
) {
  return request<API.RLong>(`/api/item/type`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 修改物品类型 修改物品类型 POST /item/type */
export async function updateItemType(
  body: API.ItemTypeVo,
  options?: { [key: string]: any },
) {
  return request<API.RBoolean>(`/api/item/type`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 复制物品到地区 此操作估计会占用较长时间，根据物品ID列表复制物品到新地区，此操作会递归复制类型及父级类型。会返回新的物品列表与新的类型列表，用于反映新的ID PUT /item/copy/${param0} */
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

/** 新增地区公用物品 通过ID列表批量添加地区公用物品 PUT /item/common */
export async function addCommonItem(body: number[], options?: { [key: string]: any }) {
  return request<API.RBoolean>(`/api/item/common`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 删除地区公用物品 通过ID列表批量删除地区公用物品 DELETE /item/common */
export async function deleteCommonItem(
  params: {
    // path
    itemId: number;
  },
  options?: { [key: string]: any },
) {
  const { itemId: param0, ...queryParams } = params;
  return request<API.RBoolean>(`/api/item/common`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 修改物品 提供修改同名物品功能，默认关闭 POST /item/update/${param0} */
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

/** 批量移动类型为目标类型的子类型 将类型批量移动到某个类型下作为其子类型 POST /item/type/move/${param0} */
export async function moveItemType(
  params: {
    // path
    targetTypeId: number;
  },
  body: number[],
  options?: { [key: string]: any },
) {
  const { targetTypeId: param0, ...queryParams } = params;
  return request<API.RBoolean>(`/api/item/type/move/${param0}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 将物品加入某一类型 根据物品ID列表批量加入，在加入多类型时需要注意类型的地区需一致，不一致会直接报错 POST /item/join/${param0} */
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

/** 列出物品类型 不递归遍历，只遍历子级；{self}表示查询自身还是查询子级，0为查询自身，1为查询子级 POST /item/get/type/${param0} */
export async function listItemType(
  params: {
    // header
// path
    self: number;
  },
  body: API.PageAndTypeListVo,
  options?: { [key: string]: any },
) {
  const { self: param0, ...queryParams } = params;
  return request<API.RPageListVoItemTypeVo>(`/api/item/get/type/${param0}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 根据筛选条件列出物品信息 传入的物品类型ID和地区ID列表，必须为末端的类型或地区 POST /item/get/list */
export async function listItemIdByType(
  params: {
    // header
},
  body: API.ItemSearchVo,
  options?: { [key: string]: any },
) {
  return request<API.RPageListVoItemVo>(`/api/item/get/list`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...params },
    data: body,
    ...(options || {}),
  });
}

/** 根据物品ID查询物品 输入ID列表查询，单个查询也用此API POST /item/get/list_byid */
export async function listItemById(
  params: {
    // header
},
  body: number[],
  options?: { [key: string]: any },
) {
  return request<API.RListItemVo>(`/api/item/get/list_byid`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...params },
    data: body,
    ...(options || {}),
  });
}

/** 列出地区公用物品 列出地区公用物品 POST /item/get/common */
export async function listCommonItem(
  body: API.PageSearchVo,
  options?: { [key: string]: any },
) {
  return request<API.RPageListVoItemVo>(`/api/item/get/common`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 通过bz2返回所有物品信息 查询所有物品信息，返回bz2压缩格式的byte数组 GET /item/get/all_bz2 */
export async function listAllItemBz2(options?: { [key: string]: any }) {
  return request<string[]>(`/api/item/get/all_bz2`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** 返回所有物品信息bz2的md5 返回所有物品信息bz2的md5 GET /item/get/all_bz2_md5 */
export async function listAllItemBz2Md5(options?: { [key: string]: any }) {
  return request<API.RString>(`/api/item/get/all_bz2_md5`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** 删除物品 根据物品ID列表批量删除物品 DELETE /item/${param0} */
export async function deleteItem(
  params: {
    // path
    itemId: number;
  },
  options?: { [key: string]: any },
) {
  const { itemId: param0, ...queryParams } = params;
  return request<API.RBoolean>(`/api/item/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 删除物品类型 批量递归删除物品类型，需在前端做二次确认 DELETE /item/type/${param0} */
export async function deleteItemType(
  params: {
    // path
    itemTypeId: number;
  },
  options?: { [key: string]: any },
) {
  const { itemTypeId: param0, ...queryParams } = params;
  return request<API.RBoolean>(`/api/item/type/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}
