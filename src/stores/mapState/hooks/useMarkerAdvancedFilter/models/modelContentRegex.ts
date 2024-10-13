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
        meta.re = new RegExp(val.s, 'ui')
      }
      catch (_err) {
        meta.re = null
      }
    }

    return meta
  }

  semantic(val: MAFValueString, _opt: MAFOptionInput, meta: MAFMetaContentRegex, opposite: boolean): MAFSemanticUnit[] {
    return [
      { type: 'text', text: '内容' },
      opposite ? { type: 'opposite-indicator', text: '不' } : null,
      { type: 'text', text: '满足正则' },
      meta.re === null ? { type: 'error', text: '正则错误' } : { type: 'regex', text: val.s },
    ].filter(v => v) as MAFSemanticUnit[]
  }

  filter(_val: MAFValueString, _opt: MAFOptionInput, meta: MAFMetaContentRegex, marker: API.MarkerVo): boolean {
    if (!meta.re)
      return false
    return meta.re.test(marker.content ?? '')
  }
}
