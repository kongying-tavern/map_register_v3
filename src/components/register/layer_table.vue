<template>
  <q-table
    title="点位表"
    row-key="id"
    :rows="formdata"
    :columns="layer_columns"
    :rows-per-page-options="[0, 10, 20, 50]"
    selection="multiple"
    v-model:selected="selected_layer_list"
    style="width: 99%; margin: 1px auto;"
    separator="cell"
    :style="{ maxHeight: collapsed ? '90vh' : '54vh' }"
    class="sticky-header"
  >
    <!-- 表格头插槽 -->
    <template v-slot:top-right>
      <div class="layer_table row">
        <q-btn
          flat
          dense
          color="primary"
          icon="mdi-help-box"
          style="margin-right: 20px"
        >
          <q-tooltip>
            <q-markup-table
              dark
              :separator="'none'"
              flat
              style="background: none"
            >
              <thead>
                <tr>
                  <th class="text-center">快捷键</th>
                  <th class="text-center">功能</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="text-center">`</td>
                  <td class="text-center">新增点位</td>
                </tr>
                <tr>
                  <td class="text-center">D</td>
                  <td class="text-center">拖拽点位</td>
                </tr>
              </tbody>
            </q-markup-table>
          </q-tooltip>
        </q-btn>
        <q-btn
          color="primary"
          label="展开/收起筛选"
          style="margin-right: 10px"
          @click="callback(5)"
        />
        <q-btn
          :disable="propitem == null"
          color="primary"
          style="margin-right: 10px"
          @click="callback(1)"
          label="新增"
        />
        <q-btn
          color="primary"
          :disable="propitem == null"
          label="刷新"
          @click="callback(6)"
        />
      </div>
    </template>
    <!-- 描述插槽 -->
    <template v-slot:body-cell-content="props">
      <q-td class="text-center">
        <div class="long_text ellipsis">
          {{ props.row.content }}
          <q-tooltip v-if="props.row.content.length > 10">
            <div class="text-warp">{{ props.row.content }}</div>
          </q-tooltip>
        </div>
      </q-td>
    </template>
    <!-- 编辑插槽 -->
    <template v-slot:header-cell-handle="props">
      <q-th class="text-left sticky-column sticky-right">操作</q-th>
    </template>
    <template v-slot:body-cell-handle="props">
      <q-td class="text-center sticky-column sticky-right">
        <a href="javascript:;" @click="callback(2, props.row)">定位</a>
        <a
          href="javascript:;"
          style="margin-left: 10px"
          @click="callback(3, props.row)">
          编辑
        </a>
        <a
          href="javascript:;"
          style="margin-left: 10px"
          @click="callback(4, props.row)">
          删除
        </a>
      </q-td>
    </template>
  </q-table>
</template>

<script>
export default {
  name: "LayerTable",
  props: ["propdata", "propitem", "collapsed"],
  data() {
    return {
      layer_data: [],
      layer_columns: [
        {
          name: "id",
          align: "center",
          label: "点位id",
          field: "id",
          align: "left",
        },
        {
          name: "markerTitle",
          align: "center",
          label: "点位名称",
          field: "markerTitle",
          align: "left",
        },
        {
          name: "content",
          align: "center",
          label: "描述",
          field: "content",
          align: "left",
        },
        {
          name: "handle",
          align: "center",
          label: "操作",
          field: "handle",
          align: "left",
        },
      ],
      selected_layer_list: [],
    };
  },
  methods: {
    callback(type, data) {
      this.$emit("callback", {
        type: type,
        data: data,
      });
    },
  },
  computed: {
    formdata() {
      this.layer_data = [...this.propdata];
      return this.layer_data;
    },
  },
};
</script>

<style scoped>
.long_text {
  width: 150px;
  margin: 0 auto;
  text-align: center;
}
.text-warp {
  width: 200px;
  white-space: pre-wrap; /* CSS 2.1 */
  word-wrap: break-word;
}
</style>

<style lang="scss" scoped>
.sticky-header {
  & :deep thead tr:first-child th {
    background-color: #fff;
    position: sticky;
    top: 0;
    z-index: 20;
  }
}
.sticky-column {
  background-color: #fff;
  position: sticky;
  z-index: 1;
  &.sticky-right {
    right: 0;
  }
  &.sticky-left {
    left: 0;
  }
}
</style>
