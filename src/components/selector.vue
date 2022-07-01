<template></template>

<script>
import { query_area } from "../service/base_data_request";
export default {
  name: "Selector",
  data() {
    return {};
  },
  methods: {},
  mounted() {
    query_area({
      parentId: -1,
      isTraverse: false,
    }).then((res) => {
      console.log(res);
    });
  },
};
</script>

<style>
</style>