import type { MAFValue } from '@/stores/types'

export interface ValuePacker {
  encode: (value: MAFValue) => Uint8Array
  decode: (bytes: Uint8Array) => MAFValue
}
