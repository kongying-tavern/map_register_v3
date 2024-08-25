<script setup lang="ts">
const {
  __APP_VERSION__: version,
  __APP_BRANCH__: branch,
  __APP_COMMIT_HASH__: commitHash,
} = window
</script>

<template>
  <div
    class="
      fixed left-0 bottom-0 w-full h-8 leading-8 px-8
      font-[HYWenHei-85W] text-white text-sm
      pointer-events-none
    "
    style="-webkit-text-stroke: 0.25px black;"
  >
    {{ `${version.toUpperCase()}_${branch.toUpperCase()}_${commitHash.toUpperCase()}` }}
  </div>
</template>
