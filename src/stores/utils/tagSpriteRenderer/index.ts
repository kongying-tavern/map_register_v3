import { createWorkerHelper } from '../createWorkerHelper'
import type { WorkerInput, WorkerSuccessOutput } from './renderer.worker'
import Worker from './renderer.worker?worker'

export const renderTagSprite = createWorkerHelper<WorkerInput, WorkerSuccessOutput>(new Worker({
  name: 'tag-sprite-renderer-worker',
}))
