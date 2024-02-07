import db from '@/database'
import { useFetchHook } from '@/hooks'

export const useTagOptions = () => {
  const tagOptions = ref<(API.TagVo & { label: string; value: string })[]>([])

  const { loading, refresh: getTagList, onSuccess, ...rest } = useFetchHook({
    immediate: true,
    onRequest: (query: string) => db.iconTag.filter(tag => !query ? true : (tag.tag?.includes(query) ?? false)).toArray(),
  })

  onSuccess((tagList) => {
    tagOptions.value = tagList.map(tag => ({
      label: tag.tag!,
      value: tag.tag!,
      ...tag,
    }))
  })

  return { tagOptions, loading, getTagList, onSuccess, ...rest }
}
