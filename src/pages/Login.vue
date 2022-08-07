<template>
  <q-card class="row fixed-center justify-center login">
    <q-card-section class="col-12">
      <div class="text-h5 text-center">
        {{ title }}
      </div>
    </q-card-section>
    <q-card-section class="col-10">
      <q-form>
        <q-input
          v-model="form.username"
          type="text"
          label="用户名"
          filled
          class="field"
        >
          <template #prepend>
            <q-icon name="account_circle"/>
          </template>
        </q-input>

        <q-input
          v-model="form.password"
          type="password"
          label="密码"
          filled
          class="field"
        >
          <template #prepend>
            <q-icon name="key"/>
          </template>
        </q-input>

        <q-btn label="登录" class="field full-width" color="primary" />
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script>
import {
  defineComponent
} from 'vue'

export default defineComponent({
  name: 'PageLogin',
  data() {
    return {
      form: {
        username: '',
        password: ''
      }
    }
  },
  computed: {
    title() {
      return process.env.VITE_TITLE
    }
  }
})
</script>

<style lang="scss" scoped>
.login {
  min-width: 450px;
}

.field {
  margin-bottom: 20px;
}
</style>
