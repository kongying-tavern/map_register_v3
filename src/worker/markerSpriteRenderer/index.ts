import type { WorkerInput, WorkerSuccessOutput } from './renderer.worker'
import Worker from './renderer.worker?worker'
import { createWorkerHelper } from '@/utils'

export const renderMarkerSprite = createWorkerHelper<WorkerInput, WorkerSuccessOutput>(new Worker({ name: '点位渲染线程' }))
