import type {
  FilterConditions,
  FilterConditionsAdvanced,
  FilterConditionsBasic,
} from '../types'
import { decode } from 'base32768'

export class PresetsUnzipper {
  unzipBasic(_data: Uint8Array): FilterConditionsBasic {
    // TODO
    return new Map()
  }

  unzipAdvanced(_data: Uint8Array): FilterConditionsAdvanced {
    // TODO
    return []
  }

  unzip(_data: Uint8Array): FilterConditions {
    // TODO: read type marker from binary, decode conditions
    return new Map()
  }

  unzipFromCode(binCode: string): FilterConditions {
    return this.unzip(decode(binCode))
  }
}
