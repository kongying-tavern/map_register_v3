import type { WorkerInput, WorkerSuccessOutput } from './renderer.worker'
import Worker from './renderer.worker?worker'
import { createWorkerHelper } from '@/utils'

export const renderTagSprite = createWorkerHelper<WorkerInput, WorkerSuccessOutput>(
  new Worker({ name: 'tag-sprite-renderer-worker' }),
  {
    label: '图标渲染',
  },
)
