import InvitationCreatorLoading from './InvitationEditorLoading.vue'

export const InvitationEditor = defineAsyncComponent({
  loader: () => import('./InvitationEditor.vue'),
  loadingComponent: InvitationCreatorLoading,
})
