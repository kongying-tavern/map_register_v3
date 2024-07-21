<script setup lang="ts">
import BarItem from './BarItem.vue'
import { useSocketStore } from '@/stores'
import { MapWindowTeleporter } from '@/pages/pageMapV2/components'

const socketStore = useSocketStore()

const id = crypto.randomUUID()

const delay = computed(() => Math.min(999, Math.max(0, socketStore.delay)))

const isOpen = computed(() => socketStore.status === WebSocket.OPEN)

const color = computed(() => {
  if (!isOpen.value)
    return 'var(--color-null)'
  if (delay.value > 500)
    return 'var(--color-slow)'
  if (delay.value > 200)
    return 'var(--color-norm)'
  return 'var(--color-fast)'
})
</script>

<template>
  <BarItem label="连接状态" divider>
    <div
      class="h-full flex items-center font-['HYWenHei-85W'] px-1"
      :style="{
        'color': color,
        '--color-null': '#3B4255',
        '--color-fast': '#97C933',
        '--color-norm': '#FFCC32',
        '--color-slow': '#FE5C5C',
      }"
    >
      <div class="h-full flex items-center">
        <el-icon :size="16" color="currentColor">
          <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="200" height="200">
            <path
              d="M944.35555555 2.27555555H780.51555555c-20.13866667 0-36.40888889 16.27022222-36.40888888 36.4088889v946.6311111c0 20.13866667 16.27022222 36.40888889 36.40888888 36.4088889h163.84c20.13866667 0 36.40888889-16.27022222 36.4088889-36.4088889V38.68444445c0-20.13866667-16.27022222-36.40888889-36.4088889-36.4088889z"
              :fill="!isOpen ? 'var(--color-null)' : delay > 200 ? 'var(--color-null)' : 'var(--color-fast)'"
            />
            <path
              d="M593.92 329.95555555H430.08c-20.13866667 0-36.40888889 16.27022222-36.40888889 36.4088889v618.9511111c0 20.13866667 16.27022222 36.40888889 36.40888889 36.4088889h163.84c20.13866667 0 36.40888889-16.27022222 36.40888889-36.4088889V366.36444445c0-20.13866667-16.27022222-36.40888889-36.40888889-36.4088889z"
              :fill="!isOpen ? 'var(--color-null)' : delay > 500 ? 'var(--color-null)' : delay > 200 ? 'var(--color-norm)' : 'var(--color-fast)'"
            />
            <path
              d="M243.48444445 657.63555555H79.64444445c-20.13866667 0-36.40888889 16.27022222-36.4088889 36.4088889v291.2711111c0 20.13866667 16.27022222 36.40888889 36.4088889 36.4088889h163.84c20.13866667 0 36.40888889-16.27022222 36.40888888-36.4088889V694.04444445c0-20.13866667-16.27022222-36.40888889-36.40888888-36.4088889z"
              :fill="!isOpen ? 'var(--color-null)' : delay > 500 ? 'var(--color-slow)' : delay > 200 ? 'var(--color-norm)' : 'var(--color-fast)'"
            />
          </svg>
        </el-icon>
      </div>

      <div class="w-[50px] h-full flex justify-end items-center">
        {{ isOpen ? `${delay}ms` : '未连接' }}
      </div>
    </div>

    <MapWindowTeleporter :id="id">
      <div>
        {{ socketStore.status }}
      </div>
    </MapWindowTeleporter>
  </BarItem>
</template>
