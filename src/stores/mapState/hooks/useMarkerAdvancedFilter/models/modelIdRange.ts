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
      idRange: [],
      idSet: new Set<number>(),
    }

    // 处理ID区间
    if (val.s) {
      const ids: string[] = val.s.split(',').filter(v => v)
      ids.forEach((id) => {
        if (id.includes('-')) {
          const idNums: string[] = id.split('-', 2)
          const idNum1: number = +idNums[0]
          const idNum2: number = +idNums[1]
          if (
            Number.isInteger(idNum1) && Number.isInteger(idNum2)
            && idNum1 > 0 && idNum2 > 0 && idNum2 > idNum1
          )
            meta.idRange.push([idNum1, idNum2])
        }
        else {
          const idNum: number = +id
          if (Number.isInteger(idNum))
            meta.idRange.push(idNum)
        }
      })
    }

    // 处理ID范围
    meta.idRange.forEach((idRange) => {
      if (Array.isArray(idRange) && idRange.length >= 2) {
        const idNum1 = idRange[0]
        const idNum2 = idRange[1]
        Array(idNum2 - idNum1 + 1)
          .fill(0)
          .forEach((_, offset) => meta.idSet.add(idNum1 + offset))
      }
      else if (Number.isFinite(idRange)) {
        meta.idSet.add(idRange as number)
      }
    })

    return meta
  }

  semantic(_val: MAFValueString, _opt: MAFOptionInput, meta: MAFMetaIdRange, opposite: boolean): MAFSemanticUnit[] {
    const idTags: string = meta.idRange
      .map(range => Array.isArray(range) ? `${range[0]}-${range[1]}` : `${range}`)
      .join(', ')
    return [
      { type: 'text', text: 'ID范围' },
      opposite ? { type: 'opposite-indicator', text: '不' } : null,
      { type: 'text', text: '为' },
      { type: 'number', text: idTags },
    ].filter(v => v)
  }

  filter(_val: MAFValueString, _opt: MAFOptionInput, meta: MAFMetaIdRange, marker: API.MarkerVo): boolean {
    return meta.idSet.has(marker.id!)
  }
}
