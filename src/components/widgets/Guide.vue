<template>
  <q-btn
    dense
    text-color="white"
    color="orange-8"
    icon="mdi-book-outline"
    @click="open_guide"
  >
    <q-tooltip anchor="center left" self="center right">使用手册</q-tooltip>
  </q-btn>
</template>

<script>
export default {
  name: "PluginGuide",
  methods: {
    open_guide() {
      window.open(import.meta.env.VITE_GUIDE_URL, "_blank");
    },
  },
};
</script>
