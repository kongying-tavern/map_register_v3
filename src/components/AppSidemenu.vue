<template>
  <q-tabs v-model="current" vertical dense class="text-teal">
    <q-tab
      v-for="item in tabs"
      :key="item.path"
      :name="item.path"
      :icon="item.meta?.icon"
      :label="item.meta?.title"
    ></q-tab>
  </q-tabs>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const tabs = computed(
  () => route.matched.find((item) => item.path === '/')?.children ?? [],
)

const current = computed({
  get: () => route.path,
  set: (path) => {
    router.push(path)
  },
})
</script>
