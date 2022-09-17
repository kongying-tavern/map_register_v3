<template>
  <div v-if="!['/login', '/'].includes(pathname)" class="breadcrumb_nav">
    <div
      v-for="(p, index) in pathList"
      :key="p"
      class="breadcrumb_item"
      :class="{ active: index === pathList.length - 1 }"
    >
      <span v-if="index === pathList.length - 1">{{ p }}</span>
      <a v-else :href="'/' + pathList.slice(0, index).join('/')">
        {{ p }}
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
let path = window.location.pathname
const pathList = ['Home', ...path.split('/').filter((item) => item !== '')]
console.log('111', pathList)
export default defineComponent({
  name: 'BreadCrumb',
  setup() {
    return {
      pathname: path,
      pathList,
    }
  },
})
</script>
<style lang="scss">
:root {
  --var-breadcrumb-gutter-md: 12px;
  --var-breadcrumb-gutter-large: 16px;
  --var-breadcrumb-gutter: var(--var-breadcrumb-gutter-large);
}
.breadcrumb_nav {
  width: fit-content;
  margin: 16px min(32px, 4vw) 8px;
  padding: 0 8px;
  display: flex;

  .breadcrumb_item {
    margin: 0;
    position: relative;
    cursor: default;

    a {
      padding: 4px 6px;
      border-radius: 3px;
      text-decoration: none;
      line-height: 17px;
      color: #767c82;
    }
    a:hover {
      background-color: rgba(46, 51, 56, 0.09);
    }

    &.active {
      color: rgb(51, 54, 57);
    }
  }
  .breadcrumb_item:not(:last-child)::after {
    content: '/';
    margin: 0 var(--var-breadcrumb-gutter);
    // position: absolute;
    // right: calc(var(--var-breadcrumb-gutter) * -1);
  }
}
</style>
