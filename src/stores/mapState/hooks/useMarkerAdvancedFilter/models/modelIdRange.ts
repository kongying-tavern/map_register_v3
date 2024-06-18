import type {
  MAFConfig,
  MAFMetaIdRange,
  MAFOptionInput,
  MAFSemanticUnit,
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

  prepare(val: MAFValueString, _opt: MAFOptionInput): MAFMetaIdRange {
    const meta: MAFMetaIdRange = {
      idSet: new Set<number>(),
    }

    // 处理ID范围
    if (val.s) {
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
    }

    return meta
  }

  semantic(_val: MAFValueString, _opt: MAFOptionInput, _meta: MAFMetaIdRange, _opposite: boolean): MAFSemanticUnit[] {
    return []
  }

  filter(_val: MAFValueString, _opt: MAFOptionInput, meta: MAFMetaIdRange, marker: API.MarkerVo): boolean {
    return meta.idSet.has(marker.id!)
  }
}