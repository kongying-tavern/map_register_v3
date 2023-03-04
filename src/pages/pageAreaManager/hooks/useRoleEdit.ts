import type { Ref } from 'vue'
import Api from '@/api/api'
import { useRowEdit } from '@/hooks/useTableManipulation'

export interface RoleEditHookOptions {
  areaList: Ref<API.AreaVo[]>
}

/** 地区信息相关业务逻辑封装 */
export const useRoleEdit = (options: RoleEditHookOptions) => {
  const { areaList } = options

  const editOptions = useRowEdit({
    rowList: areaList,
    saveHandler: async (_, newRowData) => {
      await Api.area.updateArea(newRowData)
    },
  })

  return { ...editOptions }
}
