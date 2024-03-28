import type { CursorType } from '@/shared'

export const useMapCursor = () => {
  const cursor = ref<CursorType>()

  /** 设置覆盖光标样式 */
  const setCursor = (type?: CursorType) => {
    cursor.value = type
  }

  return {
    cursor: cursor as Readonly<Ref<CursorType | undefined>>,
    setCursor,
  }
}
