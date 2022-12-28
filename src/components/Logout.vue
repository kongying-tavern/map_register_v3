<template>
  <q-card class="absolute-bottom-right q-pa-md" style="z-index: 9000">
    <q-btn
      dense
      flat
      color="primary"
      icon="logout"
      class="absolute-bottom-right"
      @click="logout"
    />
  </q-card>
</template>

<script>
import { set_user_data } from "src/service/user_info";
export default {
  name: "PluginLogout",
  methods: {
    logout() {
      set_user_data({});
      this.$router.push("/Login");
      create_notify("登出成功！");
    },
  },
};
</script>
