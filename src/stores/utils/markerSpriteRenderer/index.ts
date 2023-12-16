import { createWorkerHelper } from '../createWorkerHelper'
import type { WorkerInput, WorkerSuccessOutput } from './renderer.worker'
import Worker from './renderer.worker?worker'

export const renderMarkerSprite = createWorkerHelper<WorkerInput, WorkerSuccessOutput>(new Worker({
  name: 'marker-sprite-renderer-worker',
}))
