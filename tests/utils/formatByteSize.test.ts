import { describe, expect, it } from 'vitest'
import { formatByteSize } from '@/utils/formatByteSize'

describe('formatByteSize', () => {
  it('默认按二进制计量方式换算', () => {
    expect(formatByteSize(1024)).toBe('1.0 KiB')
  })

  it('小于进制阈值时以 Byte 为单位', () => {
    expect(formatByteSize(512)).toBe('512.0 Byte')
  })

  it('支持千分计量方式与自定义小数位', () => {
    expect(formatByteSize(1024, { binary: false, decimal: 3 })).toBe('1.024 KB')
  })
})
