import type {
  MAFConfig,
  MAFMetaContentRegex,
  MAFOptionInput,
  MAFSemanticUnit,
  MAFValueString,
} from '@/stores/types'

export class ContentRegex implements MAFConfig {
  id = 4
  name = '内容正则匹配'
  option: MAFOptionInput = {
    placeholder: '',
  }

  get defaultVal(): MAFValueString {
    return {
      s: '',
    }
  }

  prepare(val: MAFValueString, _opt: MAFOptionInput): MAFMetaContentRegex {
    const meta: MAFMetaContentRegex = {
      re: undefined,
    }

    // 处理正则表达式
    if (val.s) {
      try {
        meta.re = new RegExp(val.s, 'gui')
      }
      catch (_err) {
        meta.re = null
      }
    }

    return meta
  }

  semantic(_val: MAFValueString, _opt: MAFOptionInput, _meta: MAFMetaContentRegex, _opposite: boolean): MAFSemanticUnit[] {
    return []
  }

  filter(_val: MAFValueString, _opt: MAFOptionInput, meta: MAFMetaContentRegex, marker: API.MarkerVo): boolean {
    if (!meta.re)
      return false
    return meta.re.test(marker.content ?? '')
  }
}
