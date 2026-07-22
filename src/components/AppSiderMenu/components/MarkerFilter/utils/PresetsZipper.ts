import type {
  FilterConditions,
  FilterConditionsAdvanced,
  FilterConditionsBasic,
} from '../types'
import { encode } from 'base32768'

export class PresetsZipper {
  zipBasic(_conditions: FilterConditionsBasic): Uint8Array {
    // TODO
    return new Uint8Array()
  }

  zipAdvanced(_conditions: FilterConditionsAdvanced): Uint8Array {
    // TODO
    return new Uint8Array()
  }

  zip(_conditions: FilterConditions): Uint8Array {
    // TODO: embed type marker + encode conditions
    return new Uint8Array()
  }

  zipToCode(conditions: FilterConditions): string {
    return encode(this.zip(conditions))
  }
}
