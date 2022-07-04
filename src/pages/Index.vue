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
        <selector></selector>
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
import Selector from "../components/selector.vue";
export default {
  name: "Index",
  data() {
    return {
      map: "",
      selector_show: true,
    };
  },
  methods: {},
  components: {
    Selector,
  },

  mounted() {
    //初始化地图
    this.map = create_map();
    let base_map_layer = create_map_layer("twt");
    this.map = insert_maplayer(this.map, base_map_layer);
    this.$store.commit("record_map", map);
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
