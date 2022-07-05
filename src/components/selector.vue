<template>
  <div class="full-width row">
    <div class="col-12">
      <q-tabs dense inline-label v-model="handle_type" class="text-primary">
        <q-tab name="打点" icon="mdi-map-marker-radius" label="打点" />
        <q-tab name="审核" icon="mdi-checkbox-multiple-marked" label="审核" />
        <q-tab name="编辑" icon="mdi-circle-edit-outline" label="编辑" />
      </q-tabs>
    </div>
    <div class="col-12">
      <q-separator />
    </div>
    <div class="col-12">
      <layer-register v-show="handle_type == '打点'"></layer-register>
    </div>
  </div>
</template>

<script>
import LayerRegister from "../components/register.vue";
export default {
  name: "Selector",
  data() {
    return {
      handle_type: "打点",
    };
  },
  props: ["map"],
  components: {
    LayerRegister,
  },
  methods: {},
};
</script>

<style>
.q-tab-panel {
  padding: 2px;
}
</style>