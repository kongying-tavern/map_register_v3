<script setup>
import { ref, computed, defineComponent, onMounted } from "vue";
import { list_notice } from "src/service/notice_request";

defineComponent({
  name: "PluginNotice",
});

// 公告数据
const list = ref([]);

const refreshNotice = () => {
  list_notice({
    current: 0,
    size: 100,
    sort: ["validTimeStart-"],
    channels: ["COMMON", "DASHBOARD"],
    getValid: true,
  }).then((res) => {
    list.value = res.data?.data?.record || [];
  });
};

// 公告弹窗
const dialogVisible = ref(false);

const openDialog = () => {
  dialogSelIndex.value = 0;
  dialogVisible.value = true;
};

const closeDialog = () => {
  dialogSelIndex.value = -1;
  dialogVisible.value = false;
};

const dialogSelIndex = ref(-1);

const dialogItem = computed(() => list.value[dialogSelIndex.value] || {});

// 公告刷新机制
let fetcherTimer = null;

// 定时更新公告
onMounted(() => {
  refreshNotice();
  clearInterval(fetcherTimer);
  fetcherTimer = setInterval(() => {
    refreshNotice();
  }, 5 * 60e3);
});
</script>

<template>
  <q-btn
    dense
    text-color="primary"
    color="white"
    icon="mdi-message-processing-outline"
    @click="openDialog"
  >
    <q-tooltip anchor="center left" self="center right">公告</q-tooltip>
  </q-btn>
  <q-dialog v-model="dialogVisible" full-width>
    <q-layout view="hHh Lpr lff" container style="height: 70vh">
      <q-header>
        <q-toolbar>
          <q-icon name="mdi-view-dashboard-outline" size="sm" />
          <q-toolbar-title>公告</q-toolbar-title>
          <q-icon
            name="close"
            size="md"
            class="cursor-pointer text-fr q-pa-sm"
            @click="closeDialog()"
          />
        </q-toolbar>
      </q-header>

      <q-drawer v-model="dialogVisible" :width="300" :breakpoint="500" bordered>
        <q-scroll-area class="fit" :horizontal-thumb-style="{ opacity: 0 }">
          <q-list padding>
            <q-item
              v-for="(item, index) in list"
              :key="index"
              clickable
              :active="dialogSelIndex === index"
            >
              <q-item-section>
                {{ item.title }}
              </q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>
      </q-drawer>

      <q-page-container>
        <q-page class="q-px-lg q-py-md dialog-content">
          <div v-dompurify-html="dialogItem.content" />
        </q-page>
      </q-page-container>
    </q-layout>
  </q-dialog>
</template>

<style lang="scss" scoped>
.dialog-content {
  font-family: HYWH;
  font-size: 20px;
  line-height: 1.1;
  background-color: #d5cec7;
  color: #4f473f;

  ::v-deep(p) {
    padding: 0;
    margin: 0;
    margin-block-start: 0;
    margin-block-end: 0;
    min-height: 1.1rem;
  }
  ::v-deep(size) {
    font-size: calc(--size * 1px);
  }
  ::v-deep(color) {
    color: var(--color);
  }
}
</style>
