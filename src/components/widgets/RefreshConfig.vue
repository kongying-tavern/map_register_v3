<script setup>
import { fetch_config } from "src/service/config_request";
import {
  map_editor_config,
  map_tiles_norm_config,
  map_tiles_neigui_config,
  map_plugin_norm_config,
  map_plugin_neigui_config,
} from "src/api/config";
import { create_notify } from "src/api/common";

const refreshConfig = () => {
  fetch_config().then((config) => {
    map_editor_config.value = config?.editor || {};
    map_tiles_norm_config.value = config?.tiles || {};
    map_tiles_neigui_config.value = config?.tilesNeigui || {};
    map_plugin_norm_config.value = config?.plugins || {};
    map_plugin_neigui_config.value = config?.pluginsNeigui || {};
    create_notify("刷新配置成功");
  });
};
</script>

<template>
  <q-btn
    dense
    text-color="primary"
    color="white"
    icon="mdi-cog-refresh-outline"
    @click="refreshConfig"
  >
    <q-tooltip anchor="center left" self="center right">刷新配置</q-tooltip>
  </q-btn>
</template>
