import type { ShallowRef } from 'vue'
import type { NoticeContext } from '../context'
import { usePreferenceStore } from '@/stores'

export const useReadingRecord = (context: NoticeContext, noticeList: ShallowRef<API.NoticeVo[]>) => {
  const preferenceStore = usePreferenceStore()

  const records = computed(() => {
    const oldRecords = preferenceStore.preference['notice.state.readingRecords'] ?? []
    return new Set([...oldRecords, ...context.currentRecords.value])
  })

  const newCount = computed(() => {
    let count = 0
    noticeList.value.forEach((notice) => {
      if (!records.value.has(notice.id!))
        count += 1
    })
    return count
  })

  const initFlag = ref(true)

  watch(newCount, async (count) => {
    if (initFlag.value) {
      initFlag.value = false
      return
    }
    context.newCount.value = count
    if (count <= 0 || context.visible.value)
      return
    await nextTick()
    context.show()
  })

  const read = async (id: number) => {
    context.currentRecords.value.add(id)
  }

  context.closeHook.on(() => {
    preferenceStore.preference['notice.state.readingRecords'] = [...records.value].sort()
  })

  return {
    records,
    read,
  }
}
