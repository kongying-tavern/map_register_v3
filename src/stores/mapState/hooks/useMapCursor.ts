import type { CursorType } from '@/shared'

export const useMapCursor = () => {
  const cursor = ref<CursorType>()

  const setCursor = (type?: CursorType) => {
    cursor.value = type
  }

  return {
    cursor: cursor as Readonly<Ref<CursorType | undefined>>,
    setCursor,
  }
}
