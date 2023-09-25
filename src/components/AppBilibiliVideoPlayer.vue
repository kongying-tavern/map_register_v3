<script lang="ts" setup>
const props = defineProps<{
  url: string
}>()

const urlObject = computed(() => new URL(props.url))

const bvid = computed(() => urlObject.value.pathname.match(/(?<=(\/video\/))\S+(?=\/)/)?.[0])

const playerUrl = computed(() => {
  if (!bvid.value)
    return ''
  const params = new URLSearchParams(urlObject.value.searchParams)
  params.set('bvid', bvid.value)
  return `//player.bilibili.com/player.html?${params.toString()}`
})
</script>

<template>
  <iframe
    :src="playerUrl"
    scrolling="no"
    border="0"
    frameborder="no"
    framespacing="0"
    allowfullscreen
    style="width: 640px; height: 400px; border-radius: 8px;"
  />
</template>
