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
import { auth_guide } from "src/service/guide_request";

export default {
  name: "PluginGuide",
  methods: {
    open_guide() {
      auth_guide().then((res) => {
        if (res) {
          window.open(import.meta.env.VITE_GUIDE_URL, "_blank");
        }
      });
    },
  },
};
</script>
