<template>
  <div v-if="!['/login', '/'].includes($route.path)" class="breadcrumb_nav">
    <div
      v-for="(p, index) in [
        'Home',
        ...$route.path.split('/').filter((item) => item !== ''),
      ]"
      :key="index"
      class="breadcrumb_item"
      :class="{
        active:
          index === $route.path.split('/').filter((item) => item !== '').length,
      }"
    >
      <!-- <span
        v-if="
          index === $route.path.split('/').filter((item) => item !== '').length
        "
        >{{ p }}</span
      > -->
      <a
        :href="
          index === $route.path.split('/').filter((item) => item !== '').length
            ? $route.path
            : `/${$route.path.slice(0, $route.path.lastIndexOf('/'))}`
        "
      >
        {{ p }}
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'BreadCrumb',
  setup() {
    // const pathname = window.location.pathname
    // const pathList = pathname.split('/').filter((item) => item !== '')
    // console.log(pathname, pathList)
    // const breadcrumbList = ['Home', ...pathList]
    return {
      // pathname,
      // pathList: breadcrumbList,
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
    height: 24px;

    a {
      padding: 4px 6px;
      border-radius: 3px;
      text-decoration: none;
      color: #767c82;
    }
    a:hover {
      background-color: rgba(46, 51, 56, 0.09);
    }

    &.active {
      a {
        color: rgb(51, 54, 57);
      }
      a:hover {
        background-color: none;
      }
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
