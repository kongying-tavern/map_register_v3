<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useWebSocket } from "@vueuse/core";
import { create_notify } from "src/api/common";
import { user_id, set_user_data } from "src/service/user_info";
import { resetMap } from "src/api/map_obj";

const router = useRouter();

const WS_URL = computed(
  () => `${import.meta.env.VITE_WS_BASE}/${user_id.value}`
);

useWebSocket(WS_URL.value, {
  autoReconnect: {
    retries: 3,
    delay: 1000,
    onFailed() {
      console.error("链接WebSocket失败");
    },
  },
  heartbeat: {
    message: JSON.stringify({ action: "Ping" }),
    interval: 60e3,
    pongTimeout: 1500,
  },
  onMessage(ws, ev) {
    let json = {};
    try {
      json = JSON.parse(ev.data || "{}");
    } catch (_) {}

    switch (json.event) {
      case "UserKickedOut":
        logoutHandler();
        break;
    }
  },
});

const logoutHandler = () => {
  set_user_data({});
  resetMap();
  router.push("/Login");
  create_notify("您已被管理员强制下线", "warning");
};
</script>

<template>
  <div></div>
</template>
