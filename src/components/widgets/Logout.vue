<template>
  <q-btn
    dense
    text-color="primary"
    color="white"
    icon="logout"
    @click="logout"
  />
</template>

<script>
import { create_notify } from "src/api/common";
import { resetMap } from "src/api/map_obj";
import { set_user_data } from "src/service/user_info";

export default {
  name: "PluginLogout",
  methods: {
    logout() {
      set_user_data({});
      resetMap();
      this.$router.push("/Login");
      create_notify("登出成功！");
    },
  },
};
</script>
