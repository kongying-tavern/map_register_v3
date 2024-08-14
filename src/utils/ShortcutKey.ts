import { CONTROL_KEYS, STANDARD_KEYBOARD_KEYS } from '@/shared'

export class ShortcutKeyUtil {
  static parse = (value: string, separator = '_') => {
    return value
      .split(separator)
      .filter(key => STANDARD_KEYBOARD_KEYS.has(key.toLowerCase()))
      .map(key => key.toLowerCase())
  }

  static stringify = (keys: string[], separator = '_') => {
    return keys
      .map(key => key.toLowerCase())
      .filter(key => STANDARD_KEYBOARD_KEYS.has(key))
      .join(separator)
  }

  static buildKeysFromEvent = (ev: KeyboardEvent) => {
    const hotKeys: string[] = []
    const { ctrlKey, shiftKey, altKey, key } = ev
    const lowerCaseKey = key.toLowerCase()
    ctrlKey && hotKeys.push('control')
    shiftKey && hotKeys.push('shift')
    altKey && hotKeys.push('alt')
    !CONTROL_KEYS.has(lowerCaseKey) && hotKeys.push(lowerCaseKey)
    return hotKeys
  }
}
