<template>
  <div>
    <template v-for="itemGroup in itemConfig">
      <div
        v-if="itemGroup.itemList && itemGroup.itemList.length"
        class="item-group">
        <label class="title">{{itemGroup.type.name}}</label>
        <div class="row">
          <div
            v-for="item in itemGroup.itemList"
            class="col-6 item-entry cursor-pointer"
            @click="item_update(item)">
            <q-radio
              v-model="item_selected"
              :val="item"
              :label="item.name"
              dense
              size="lg"
              :keep-color="false"
              :checked-icon="`img:${item.iconUrl}`"
              :unchecked-icon="`img:${item.iconUrl}`"
              @update:model-value="item_update">
            </q-radio>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    itemConfig: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      item_selected: {}
    }
  },
  methods: {
    item_update(item = {}) {
      this.item_selected = item;
      this.$emit('update', this.item_selected)
    }
  }
}
</script>

<style lang="scss" scoped>
.item-group {
  & + .item-group {
    border-top: 1px solid #ddd;
  }
  .title {
    font-size: 1.2rem;
    font-weight: bold;
    line-height: 2.6rem;
  }
}
.item-entry {
  line-height: 2.5rem;
  border-radius: 1.2rem;
  padding-left: .4rem;

  &:hover {
    background-color: #e3eefa;
  }
}
</style>
