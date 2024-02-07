import { WorkerInterval } from '@/utils/WorkerInterval'

export const secondClock = ref(new Date().getTime())

WorkerInterval.set('second-clock', () => {
  secondClock.value = new Date().getTime()
}, 1000)
