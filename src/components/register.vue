<template>
  <div class="row" style="margin-top: 10px">
    <selector @callback="get_item_list"></selector>
    <div class="col-12">
      <q-separator spaced />
    </div>
  </div>
</template>

<script>
import Selector from "./register/register_selector.vue";
export default {
  data() {
    return {
      loading: false,
    };
  },
  methods: {
    get_item_list(value){
      console.log(value);
    }
  },
  components: {
    Selector,
  },
};
</script>

<style>
</style>