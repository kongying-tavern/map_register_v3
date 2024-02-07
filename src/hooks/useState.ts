export const useState = <T>(initialState: T) => {
  const state = ref(initialState) as Ref<T>

  const setState = (newState: T) => {
    state.value = newState
  }

  return [state, setState] as const
}
