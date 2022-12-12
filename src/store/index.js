import { store } from 'quasar/wrappers'
import { createStore } from 'vuex'

// Import example from './module-example'

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default store((/* { ssrContext } */) => {
  const Store = createStore({
    state: {
      map: null,
      handle_type: '打点'
    },
    mutations: {
      record_map(state, data) {
        state.map = data;
      },
      type_switch(state, data) {
        state.handle_type = data;
      }
    },
    // Enable strict mode (adds overhead!)
    // for dev mode and --debug builds only
    strict: process.env.DEBUGGING
  })

  return Store
})
