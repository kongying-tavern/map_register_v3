import type {
  MAFConfig,
  MAFMetaIdRange,
  MAFOptionInput,
  MAFValueInput,
} from '@/stores/types'

export const idRange: MAFConfig = {
  id: 1,
  name: 'ID范围',
  option: {
    placeholder: '格式为数字，A,B或A-B',
  },
  defaultVal: {
    v: '',
  },
  prepare: (val: MAFValueInput): MAFMetaIdRange => {
    const meta: MAFMetaIdRange = {
      idSet: new Set<number>(),
    }

    if (!val.v)
      return meta

    const ids: string[] = val.v.split(',')
    for (const id of ids) {
      if (!id) {
        continue
      }
      else if (id.includes('-')) {
        const idNums: string[] = id.split('-', 2)
        const idNum1: number = Number(idNums[0])
        const idNum2: number = Number(idNums[1])
        if (Number.isFinite(idNum1) && Number.isFinite(idNum2) && idNum2 > idNum1) {
          Array(idNum2 - idNum1 + 1)
            .fill(0)
            .forEach((_, offset) => {
              meta.idSet.add(idNum1 + offset)
            })
        }
      }
      else {
        const idNum: number = Number(id)
        if (Number.isFinite(idNum))
          meta.idSet.add(idNum)
      }
    }
    return meta
  },
  semantic: () => '',
  filter: (_val: MAFValueInput, _opt: MAFOptionInput, meta: MAFMetaIdRange, marker: API.MarkerVo): boolean => {
    return meta.idSet.has(marker.id!)
  },
}
