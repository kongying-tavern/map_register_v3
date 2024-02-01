<template>
  <q-layout class="main">
    <!-- 地图容器 -->
    <div class="map_containor">
      <div class="stars"></div>
      <div class="twinkling"></div>
      <div id="map" ref="mapDom"></div>
    </div>
    <!-- 侧面筛选器 -->
    <q-card
      v-show="selector_show"
      class="absolute-top-left full-height q-pa-sm"
      square
      style="width: 600px; z-index: 2000"
    >
      <div class="full-width row">
        <div class="col-12" v-show="false">
          <q-tabs dense inline-label v-model="handle_type" class="text-primary">
            <q-tab name="打点" icon="mdi-map-marker-radius" label="打点" />
            <q-tab
              name="审核"
              icon="mdi-checkbox-multiple-marked"
              label="审核"
            />
            <q-tab name="编辑" icon="mdi-circle-edit-outline" label="编辑" />
          </q-tabs>
        </div>
      </div>

      <q-tab-panels
        v-model="handle_type"
        animated
        class="absolute-full q-pa-md"
      >
        <q-tab-panel name="打点" class="relative-position">
          <layer-register
            @map_switch="map_switch"
            v-show="handle_type == '打点'"
          >
          </layer-register>
        </q-tab-panel>

        <q-tab-panel name="审核"></q-tab-panel>

        <q-tab-panel name="编辑">
          <layer-register :map="map" v-show="handle_type == '审核'">
          </layer-register>
        </q-tab-panel>
      </q-tab-panels>

      <div class="close">
        <q-btn
          dense
          color="white"
          text-color="black"
          icon="mdi-close"
          @click="selector_show = false"
        />
      </div>
    </q-card>
    <q-btn
      dense
      color="primary"
      icon="mdi-menu"
      class="absolute-top-left"
      @click="selector_show = true"
      style="z-index: 1500"
    />
  </q-layout>

  <map-overlay :area="area"></map-overlay>
  <div
    class="absolute-bottom-right q-gutter-sm"
    style="z-index: 9000; display: flex; flex-direction: column"
  >
    <guide size="md"></guide>
    <refresh-config size="md"></refresh-config>
    <logout size="md"></logout>
  </div>
</template>

<script>
import { nextTick } from "vue";
import { mapDom, createMap } from "src/api/map_obj";
import {
  map_editor_config,
  map_tiles_norm_config,
  map_tiles_neigui_config,
  map_plugin_norm_config,
  map_plugin_neigui_config,
} from "../api/config";
import LayerRegister from "../components/register.vue";
import MapOverlay from "../components/plugins/map-overlay.vue";
import Guide from "../components/widgets/Guide.vue";
import RefreshConfig from "../components/widgets/RefreshConfig.vue";
import Logout from "../components/widgets/Logout.vue";
import { refresh_token } from "../service/user_log_request";
import { fetch_config } from "../service/config_request";
import {
  set_user_data,
  is_expired,
  user_refresh_interval,
} from "../service/user_info";

export default {
  name: "PageIndex",
  setup() {
    return {
      mapDom,

      VITE_ENV_BANNER: import.meta.env.VITE_ENV_BANNER,
    };
  },
  data() {
    return {
      area: {},
      selector_show: true,
      handle_type: "打点",
    };
  },
  methods: {
    init_map() {
      // 初始化地图
      createMap();
    },
    load_config() {
      return fetch_config().then((config) => {
        map_editor_config.value = config?.editor || {};
        map_tiles_norm_config.value = config?.tiles || {};
        map_tiles_neigui_config.value = config?.tilesNeigui || {};
        map_plugin_norm_config.value = config?.plugins || {};
        map_plugin_neigui_config.value = config?.pluginsNeigui || {};
      });
    },
    show_notify() {
      if (map_editor_config.value?.bannerText) {
        this.$q.notify({
          type: "info",
          color: "primary",
          position: "top",
          timeout: 0,
          message: map_editor_config.value?.bannerText,
          actions: [
            {
              label: "我知道了",
              color: "yellow-6",
            },
          ],
        });
      }

      if (import.meta.env.VITE_ENV_MSG) {
        this.$q.notify({
          type: "warning",
          color: "orange-2",
          position: "top",
          timeout: 0,
          message: import.meta.env.VITE_ENV_MSG,
          actions: [
            {
              label: "我知道了",
              color: "primary",
            },
          ],
        });
      }
    },
    // 切换地图
    map_switch(area) {
      this.area = area;
      createMap(area.code);
    },
  },
  components: {
    LayerRegister,
    MapOverlay,
    Guide,
    RefreshConfig,
    Logout,
  },
  mounted() {
    this.load_config().then(() => {
      this.show_notify();
      this.init_map();
      if (localStorage.getItem("marked_layers") === null) {
        localStorage.setItem("marked_layers", JSON.stringify([]));
      }
    });

    setInterval(() => {
      nextTick(() => {
        if (is_expired()) {
          refresh_token().then((res) => {
            set_user_data(res.data || {});
          });
        }
      });
    }, user_refresh_interval);
  },
  watch: {
    handle_type(val) {
      this.$store.commit("type_switch", val);
      this.init_map();
    },
  },
};
</script>

<style scoped>
@import url("https://yuanshen.site/css/background.css");
#map {
  width: 100vw;
  height: 100vh;
  background: transparent;
}
.item_list {
  width: 100%;
}
.close {
  position: absolute;
  top: 10px;
  right: -15px;
  z-index: 1500;
}
.q-tab-panel {
  padding: 0;
}
</style>
