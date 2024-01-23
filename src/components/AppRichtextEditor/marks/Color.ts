import { Mark, getMarkAttributes } from '@tiptap/core'

export const Color = Mark.create<{
  HTMLAttributes: Record<string, string>
}>({
  name: 'color',
  addOptions: () => {
    return {
      HTMLAttributes: {},
    }
  },
  parseHTML: () => {
    return [
      {
        tag: 'color',
        getAttrs: (node) => {
          if (typeof node === 'string' || !node.hasAttribute('style'))
            return false
          return {}
        },
      },
    ]
  },
  renderHTML({ HTMLAttributes }) {
    return ['color', { ...this.options.HTMLAttributes, ...HTMLAttributes }, 0]
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
