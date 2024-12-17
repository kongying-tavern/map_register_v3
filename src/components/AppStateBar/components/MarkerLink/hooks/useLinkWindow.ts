import { Subject } from 'rxjs'
import { useAppWindow } from '@/components'

interface LinkWindowHookOptions {
  loading: Ref<boolean>
}

export const useLinkWindow = (options: LinkWindowHookOptions) => {
  const { loading } = options

  const start$ = new Subject<void>()
  const close$ = new Subject<void>()

  const { info, toggle, close } = useAppWindow({
    name: '点位关联',
    minWidth: 580,
    beforeOpen: () => {
      start$.next()
      return true
    },
    beforeClose: () => {
      if (loading.value)
        return false
      close$.next()
      return true
    },
  })

  return {
    start$,
    close$,
    info,
    toggle,
    close,
  }
}
