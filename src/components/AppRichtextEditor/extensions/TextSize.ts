import '@766aya/extension-text-size'

import { Extension } from '@tiptap/core'

export interface SizeOptions {
  types: string[]
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    size: {
      /**
       * Set the text size
       */
      setSize: (size: number) => ReturnType
      /**
       * Unset the text size
       */
      unsetSize: () => ReturnType
    }
  }
}

export const TextSize = Extension.create<SizeOptions>({
  name: 'textSize',
  addOptions() {
    return {
      types: ['size'],
    }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          size: {
            default: null,
            parseHTML: (element) => {
              return element.style.fontSize?.replace(/['"]+/g, '')
            },
            renderHTML: (attributes) => {
              return !attributes.size
                ? {}
                : {
                    style: `--size: ${attributes.size}`,
                  }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setSize: size => ({ chain }) => {
        return chain()
          .setMark('size', { size })
          .run()
      },
      unsetSize: () => ({ chain }) => {
        return chain()
          .setMark('size', { size: null })
          .removeEmptyTextStyle()
          .run()
      },
    }
  },
})
