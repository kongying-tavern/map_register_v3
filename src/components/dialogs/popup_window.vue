<template>
  <div id="opened_popup"></div>
</template>

<script>
export default {
  name: "PopupWindow",
  data() {
    return {
      layer_data: {},
    };
  },
  props: ["layer", "map"],
  methods: {
    //向父组件传递事件类型，由于使用了Vue实例注入形式，故使用VUEX来传递
    callback_handle(type) {},
    //标记点位
    mark_layer() {},
  },
  mounted() {},
};
</script>
<style scoped>
p {
  margin: 10px auto;
  font-size: 16px;
}
</style>
<style>
.leaflet-popup-content {
  width: 100% !important;
}
.layer_img {
  display: block;
  margin: 0 auto;
  width: 200px;
  height: 200px;
}
.leaflet-popup-close-button {
  zoom: 2;
}
</style>