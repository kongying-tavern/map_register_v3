<script lang="ts" setup>
const props = defineProps<{
  url: string
}>()

useUrlSearchParams()

const playerUrl = computed(() => {
  const bvid = props.url.match(/\/video\/([a-zA-Z0-9]+)/)?.[1]
  if (!bvid)
    return ''
  const urlObject = new URL(props.url)
  const params = new URLSearchParams(urlObject.searchParams)
  params.set('bvid', bvid)
  const iframeUrl = `//player.bilibili.com/player.html?${params.toString()}`
  return iframeUrl
})
</script>

<template>
  <iframe
    :src="playerUrl"
    scrolling="no"
    border="0"
    frameborder="no"
    framespacing="0"
    allowfullscreen="true"
    style="width: 640px; height: 400px; border-radius: 8px;"
  />
</template>
