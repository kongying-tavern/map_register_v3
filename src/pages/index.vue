<template>
  <div class="index_page">
    <a href="/login">Login</a>
    <br />
    <a href="/users">Users</a>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'IndexPage',
  setup() {
    return {}
  },
})
</script>

<style lang="scss" scoped>
.index_page {
  margin: 16px min(32px, 4vw);
}
</style>
