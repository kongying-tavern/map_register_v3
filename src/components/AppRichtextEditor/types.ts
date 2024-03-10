import type { Editor } from '@tiptap/core'

export interface HeaderConfig {
  headerMin?: number
  headerMax?: number
  headers?: number[]
}

export interface EditorConfig {
  defaultForeground?: string
  defaultBackground?: string
  viewFont?: string
  viewZoom?: number
  viewLineHeight?: number
}

export type EditorProps = EditorConfig & HeaderConfig & {
  contentHeight?: number
  sizeRatio?: number
  baseTextSize: number
}

export interface HeaderToolbarProps extends HeaderConfig {
  editor: Editor
  baseSize?: number
}
