<template>
  <div class="row" style="margin-top: 10px">
    <div class="row col-12">
      <div class="text-h6 col-12">按地区分类：</div>
      <q-option-group
        v-model="selected_area"
        :options="area_list"
        inline
        color="primary"
        @update:model-value="clear_list"
      />
    </div>
    <div v-show="selected_area == null ? false : true">
      <div class="row col-12" style="margin-top: 10px">
        <div class="text-h6 col-12">按类型分类：</div>
        <q-option-group
          v-model="selected_item_type"
          :options="item_type_list"
          @update:model-value="select_item_list"
          inline
          color="primary"
        />
      </div>
      <div class="col-12" style="margin-top: 10px">
        <div class="text-h6 col-12">按物品分类：</div>
        <q-option-group
          v-model="item_list_group"
          :options="item_list_options"
          color="primary"
          @update:model-value="select_item_layers"
          inline
        />
      </div>
      <div class="col-12">
        <q-table
          title="点位表"
          row-key="id"
          :rows="layer_data"
          :columns="layer_columns"
          selection="multiple"
          v-model:selected="selected_layer_list"
          :rows-per-page-options="[0]"
          style="max-height: 60vh; margin-top: 10px"
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
                        <td class="text-center">ESC</td>
                        <td class="text-center">取消点位新增</td>
                      </tr>
                      <tr>
                        <td class="text-center">D</td>
                        <td class="text-center">拖拽点位</td>
                      </tr>
                    </tbody>
                  </q-markup-table>
                </q-tooltip>
              </q-btn>
              <q-btn color="primary" label="新增" />
              <q-btn
                color="primary"
                style="margin-left: 20px"
                label="批量修改"
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
          <template v-slot:body-cell-handle="props">
            <q-td class="text-center">
              <a href="javascript:;">定位</a>
              <a href="javascript:;" style="margin-left: 10px">编辑</a>
              <a href="javascript:;" style="margin-left: 10px">删除</a>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>

    <q-inner-loading :showing="loading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
  </div>
</template>

<script>
import {
  query_area,
  query_itemtype,
  query_itemlist,
  query_itemlayer_idlist,
  query_itemlayer_infolist,
} from "../service/base_data_request";
export default {
  name: "LayerRegister",
  data() {
    return {
      selected_area: null,
      area_list: [],
      selected_item_type: null,
      item_type_list: [],
      item_list_group: null,
      item_list_options: [],
      loading: false,
      layer_data: [],
      layer_columns: [
        {
          name: "id",
          align: "center",
          label: "点位id",
          field: "markerId",
        },
        {
          name: "content",
          align: "center",
          label: "描述",
          field: "content",
        },
        {
          name: "handle",
          align: "center",
          label: "操作",
          field: "handle",
        },
      ],
      selected_layer_list: [],
    };
  },
  methods: {
    //清除已查询列表
    clear_list() {
      this.selected_item_type = null;
      this.item_list_options = [];
    },
    //查询物品总集列表
    select_item_list(value) {
      this.item_list_options = [];
      this.loading = true;
      query_itemlist({
        typeIdList: [value],
        areaIdList: [this.selected_area],
        current: 0,
        size: 999,
      }).then((res) => {
        for (let i of res.data.data.record) {
          this.item_list_options.push({
            label: i.name,
            value: i.itemId,
          });
        }
        this.loading = false;
      });
    },
    //查询单个物品下属所有点位
    select_item_layers(value) {
      this.layer_data = [];
      this.loading = true;
      query_itemlayer_idlist({
        typeIdList: [],
        areaIdList: [],
        itemIdList: [value],
        getBeta: 0,
      }).then((res) => {
        query_itemlayer_infolist(res.data.data).then((res) => {
          this.loading = false;
          this.layer_data = res.data.data;
        });
      });
    },
  },
  mounted() {
    //查询所有地区
    query_area({
      parentId: -1,
      isTraverse: true,
    }).then((res) => {
      this.area_list = [];

      for (let i of res.data.data) {
        if (i.parentId != -1) {
          this.area_list.push({
            label: i.name,
            value: i.areaId,
          });
        }
      }
      //查询所有类型
      query_itemtype(1, {
        current: 1,
        typeIdList: [],
        size: 999,
      }).then((res) => {
        this.item_type_list = [];
        for (let i of res.data.data.record) {
          this.item_type_list.push({
            label: i.name,
            value: i.typeId,
          });
        }
        this.loading = false;
      });
    });
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