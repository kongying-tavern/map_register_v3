<template>
  <q-layout class="main">
    <!-- 地图容器 -->
    <div class="map_containor">
      <div class="stars"></div>
      <div class="twinkling"></div>
      <div id="map"></div>
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
            :map="map"
            @map_switch="map_switch"
            v-show="handle_type == '打点'"
          >
          </layer-register>
        </q-tab-panel>

        <q-tab-panel name="审核"></q-tab-panel>

        <q-tab-panel name="编辑">
          <layer-register
            :map="map"
            v-show="handle_type == '审核'"
          ></layer-register>
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
    <!-- 额外操作器 -->
    <q-card
      v-if="area.code === 'A:APPLE:2_8'"
      class="absolute-top-right q-pa-md"
      style="z-index: 9000"
    >
      <div style="width: 300px" v-if="extra_show === true">
        <q-btn
          dense
          flat
          color="white"
          text-color="black"
          icon="mdi-close"
          class="absolute-top-right"
          @click="extra_show = false"
        />
        <island-selector :map="map"></island-selector>
      </div>
      <div v-else>
        <q-btn
          dense
          flat
          color="primary"
          icon="mdi-island"
          class="absolute-top-right"
          @click="extra_show = true"
        />
      </div>
    </q-card>
  </q-layout>

  <logout></logout>
</template>

<script>
import { create_map } from "../api/map";
import LayerRegister from "../components/register.vue";
import IslandSelector from "../components/plugins/2_8_island/selector.vue";
import Logout from "../components/Logout.vue";
import { refresh_token } from "../service/user_log_request";
import { is_expired, set_user_data } from "../service/user_info";
export default {
  name: "PageIndex",
  data() {
    return {
      map: null,
      area: {},
      selector_show: true,
      handle_type: "打点",
      extra_show: false,

      map_name: "金苹果群岛",
    };
  },
  methods: {
    init_map() {
      // 初始化地图
      this.map = create_map("提瓦特-base0");
    },
    // 切换地图
    map_switch(area) {
      this.area = area;
      this.map_name = area.name;

      this.extra_show = false;
      if (area.code === "A:APPLE:2_8") {
        this.extra_show = true;
      }

      this.map.remove();
      this.map = create_map(area.code);
    },
  },
  components: {
    LayerRegister,
    IslandSelector,
    Logout,
  },
  mounted() {
    this.init_map();
    if (localStorage.getItem("marked_layers") === null) {
      localStorage.setItem("marked_layers", JSON.stringify([]));
    }

    setInterval(() => {
      if (is_expired()) {
        refresh_token().then((res) => {
          set_user_data(res.data || {});
        });
      }
    }, 300e3);
  },
  watch: {
    handle_type(val) {
      this.$store.commit("type_switch", val);
      this.map.remove();
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
