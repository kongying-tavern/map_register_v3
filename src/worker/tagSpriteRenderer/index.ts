import type { WorkerInput, WorkerSuccessOutput } from './renderer.worker'
import Worker from './renderer.worker?worker'
import { createWorkerHelper } from '@/utils'

export const renderTagSprite = createWorkerHelper<WorkerInput, WorkerSuccessOutput>(new Worker({ name: '图标渲染线程' }))
