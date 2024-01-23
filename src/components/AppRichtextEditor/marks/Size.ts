import { Mark, getMarkAttributes } from '@tiptap/core'

export const Size = Mark.create<{
  HTMLAttributes: Record<string, string>
}>({
  name: 'size',
  addOptions: () => {
    return {
      HTMLAttributes: {},
    }
  },
  parseHTML: () => {
    return [
      {
        tag: 'size',
        getAttrs: (node) => {
          if (typeof node === 'string' || !node.hasAttribute('style'))
            return false
          return {}
        },
      },
    ]
  },
  renderHTML({ HTMLAttributes }) {
    return ['size', { ...this.options.HTMLAttributes, ...HTMLAttributes }, 0]
  },
  addCommands() {
    return {
      removeEmptyTextStyle: () => ({ state, commands }) => {
        const attributes = getMarkAttributes(state, this.type)
        const hasStyles = Object.entries(attributes).some(([, value]) => value !== undefined)
        if (hasStyles)
          return true
        return commands.unsetMark(this.name)
      },
    }
  },
})
