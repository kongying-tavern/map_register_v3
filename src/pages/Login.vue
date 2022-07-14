<template>
  <q-layout>
    <div class="logon row">
      <q-card
        class="
          log_card
          absolute-center
          row
          justify-center
          q-pa-md
          col-lg-3 col-md-5 col-sm-6
        "
      >
        <q-card-section class="row col-12">
          <div class="col-12" style="margin-top: 25px">
            <p class="log_title">空荧酒馆地图点位标记系统</p>
          </div>
        </q-card-section>
        <q-card-section class="col-10">
          <div>
            <q-input filled v-model="username" label="用户名">
              <template v-slot:prepend>
                <q-icon name="account_circle" />
              </template>
            </q-input>
          </div>
          <div style="margin-top: 15px">
            <q-input
              filled
              v-model="password"
              label="密码"
              type="password"
              @keyup.enter="log"
            >
              <template v-slot:prepend>
                <q-icon name="vpn_key" />
              </template>
            </q-input>
          </div>
          <div style="margin-top: 15px">
            <q-btn
              color="primary"
              label="登录"
              class="logon_btn full-width"
              @click="log"
              :loading="loading"
            />
          </div>
        </q-card-section>
      </q-card>
      <span class="absolute-bottom copyright">Copyright2022©空荧酒馆</span>
    </div>
  </q-layout>
</template>

<script>
import { get_token } from "../service/user_log_request";
import { create_notify } from "../api/common";
export default {
  name: "logon",
  data() {
    return {
      username: "",
      password: "",
      loading: false,
    };
  },
  methods: {
    log() {
      this.loading = true;
      get_token(this.username, this.password)
        .then((res) => {
          this.loading = false;
          this.$q.cookies.set("_yuanshen_dadian_token", res.data.access_token, {
            expires: `${res.data.expires_in}s`,
          });
          this.$router.push("/");
        })
        .catch((err) => {
          this.loading = false;
          create_notify(err.response.data.error, "negative");
        });
    },
  },
  mounted() {},
};
</script>

<style lang="scss">
.log_card {
  width: 500px;
  .logo {
    display: block;
    margin: 0 auto;
    width: 150px;
    height: 150px;
  }
  .log_title {
    width: 100%;
    font-size: 28px;
    font-weight: bold;
    text-align: center;
  }
}
.copyright {
  width: 100%;
  text-align: center;
  color: rgba(0, 0, 0, 0.45);
  font-size: 16px;
  bottom: 10px;
}
</style>