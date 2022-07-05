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
      <q-scroll-area
        :thumb-style="{ background: 'none' }"
        style="width: 100%; height: 100%"
      >
        <div class="full-width row">
          <div class="col-12">
            <q-tabs
              dense
              inline-label
              v-model="handle_type"
              class="text-primary"
            >
              <q-tab name="打点" icon="mdi-map-marker-radius" label="打点" />
              <q-tab
                name="审核"
                icon="mdi-checkbox-multiple-marked"
                label="审核"
              />
              <q-tab name="编辑" icon="mdi-circle-edit-outline" label="编辑" />
            </q-tabs>
          </div>
          <div class="col-12">
            <q-separator />
          </div>
          <div class="col-12">
            <layer-register
              :map="map"
              v-show="handle_type == '打点'"
            ></layer-register>
          </div>
        </div>
      </q-scroll-area>
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
  </q-layout>
</template>

<script>
import {
  create_map_layer,
  create_map,
  insert_maplayer,
  switch_map,
} from "../api/map";
import LayerRegister from "../components/register.vue";
export default {
  name: "Index",
  data() {
    return {
      map: "",
      selector_show: true,
      handle_type: "打点",
    };
  },
  methods: {},
  components: {
    LayerRegister,
  },
  mounted() {
    //初始化地图
    this.map = create_map();
    let base_map_layer = create_map_layer("twt");
    this.map = insert_maplayer(this.map, base_map_layer);
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
</style>
