import type {
  MAFConfig,
  MAFMetaIdRange,
  MAFOptionInput,
  MAFValueString,
} from '@/stores/types'

export class IdRange implements MAFConfig {
  id = 1
  name = 'ID范围'
  option: MAFOptionInput = {
    placeholder: '格式：1,2,3-5',
  }

  get defaultVal(): MAFValueString {
    return {
      s: '',
    }
  }

  prepare(val: MAFValueString): MAFMetaIdRange {
    const meta: MAFMetaIdRange = {
      idSet: new Set<number>(),
    }

    if (!val.s)
      return meta

    const ids: string[] = val.s.split(',')
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
  }

  semantic(val: MAFValueString, _opt: MAFOptionInput, meta: MAFMetaIdRange, opposite: boolean): string {
    if (meta.idSet.size <= 0)
      return opposite ? '不限ID' : 'ID不属于任何范围'
    return `ID${opposite ? '不' : ''}属于范围【${val.s ?? ''}】`
  }

  filter(_val: MAFValueString, _opt: MAFOptionInput, meta: MAFMetaIdRange, marker: API.MarkerVo): boolean {
    return meta.idSet.has(marker.id!)
  }
}
