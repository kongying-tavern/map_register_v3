import type { WorkerInput, WorkerSuccessOutput } from './renderer.worker'
import Worker from './renderer.worker?worker'
import { createWorkerHelper } from '@/utils'

export const renderMarkerSprite = createWorkerHelper<WorkerInput, WorkerSuccessOutput>(
  new Worker({ name: 'marker-sprite-renderer-worker' }),
  {
    label: '点位渲染',
  },
)
