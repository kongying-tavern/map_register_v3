<template>
  <q-icon
    name="mdi-content-save"
    style="margin-right: 15px"
    size="35px"
    class="icon_btn"
    @click="save_window_open"
  >
    <q-tooltip> 存档管理 </q-tooltip>
  </q-icon>
  <q-icon
    name="mdi-comment-text-multiple-outline"
    style="margin-right: 15px"
    size="35px"
    class="icon_btn"
    @click="openURL('https://support.qq.com/product/321980')"
  >
    <q-tooltip> 反馈 </q-tooltip>
  </q-icon>
  <q-icon
    name="mdi-account-multiple"
    style="margin-right: 15px"
    class="icon_btn"
    size="35px"
    @click="openURL('https://yuanshen.site/docs/communication-group.html')"
  >
    <q-tooltip> 加入讨论组 </q-tooltip>
  </q-icon>
  <q-icon
    name="mdi-download-network"
    class="icon_btn"
    size="35px"
    @click="openURL('https://yuanshen.site/docs/download-client.html')"
  >
    <q-tooltip> 下载客户端 </q-tooltip>
  </q-icon>
  <!-- 存档弹窗 -->
  <q-dialog v-model="save_dialog">
    <q-card style="max-width: 100vw">
      <q-table
        title="存档列表"
        :rows="table_data"
        :columns="table_columns"
        :rows-per-page-options="[0]"
        selection="single"
        style="max-height: 50vh"
        v-model:selected="selected"
        row-key="id"
      >
        <!-- 表格内操作按钮插槽 -->
        <template v-slot:body-cell-handle="props">
          <q-td class="text-center">
            <a href="javascript:;">读取存档</a>
            <a href="javascript:;" style="margin-left: 20px">删除</a>
          </q-td>
        </template>
      </q-table>
      <q-inner-loading :showing="save_request_loading">
        <q-spinner-gears size="50px" color="primary" />
      </q-inner-loading>
    </q-card>
  </q-dialog>
</template>

<script>
import { openURL } from "quasar";
export default {
  name: "ExtraBtn",
  data() {
    return {
      save_dialog: false,
      table_data: [{
          description:'1',
          created_at:'2022-6-6 08:33:49',
          updated_at:'2022-6-6 08:33:49'
      }],
      table_columns: [
        {
          name: "description",
          align: "center",
          label: "存档名称",
          field: "description",
        },
        {
          name: "created_at",
          align: "center",
          label: "创建时间",
          field: "created_at",
          format: (val) => `${val.slice(0, 10)} ${val.slice(11, 19)}`,
        },
        {
          name: "updated_at",
          align: "center",
          label: "最后更新时间",
          field: "updated_at",
          format: (val) => `${val.slice(0, 10)} ${val.slice(11, 19)}`,
        },
        {
          name: "handle",
          align: "center",
          label: "操作",
          field: "handle",
        },
      ],
      save_request_loading: false,
      selected: [],
    };
  },
  methods: {
    save_window_open() {
      this.save_dialog = true;
    },
    openURL,
  },
};
</script> 

<style scoped>
.icon_btn {
  cursor: pointer;
}
</style>