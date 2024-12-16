import { Subject } from 'rxjs'
import { useAppWindow } from '@/components'

export const useLinkWindow = () => {
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
