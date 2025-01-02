import type { ModifierConstructorOptions } from '..'
import { Modifier } from '..'

export class TimeModifier extends Modifier {
  previewer = defineAsyncComponent(() => import('../PreviewImpls/RefreshTime.vue'))

  constructor(options: ModifierConstructorOptions) {
    super(options, {
      update: {
        label: '更新',
        modify: (data, { value = '' }) => {
          const { field } = this.options
          return { ...data, [field]: value }
        },
        cardComp: () => import('../CardImpls/TimeUpdate.vue'),
      },
    })
  }
}
