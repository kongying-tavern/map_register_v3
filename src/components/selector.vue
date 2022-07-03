<template>
  <div class="full-width row q-pa-sm">
    <div class="col-12">
      <q-tabs
        dense
        v-model="selected_id_list.main_area_id"
        class="text-primary"
      >
        <q-tab v-for="i in area_list" :name="i.areaId" :label="i.name" />
      </q-tabs>
    </div>
  </div>
</template>

<script>
import { query_main_area } from "../service/base_data_request";
export default {
  name: "Selector",
  data() {
    return {
      selected_id_list: {
        main_area_id: "",
        child_area_id: "",
      },
      area_list: [],
    };
  },
  methods: {},
  mounted() {
    //查询所有地区
    query_main_area({
      parentId: -1,
      isTraverse: true,
    }).then((res) => {
      this.area_list = res.data.data;
    });
  },
};
</script>

<style>
</style>