import type { DeckProps } from '@deck.gl/core/typed'

declare namespace GSMap {
  type ExtractParamters<T extends keyof DeckProps> = Parameters<NonNullable<DeckProps[T]>>

  interface ConstructorOptions extends DeckProps {
    canvas: HTMLCanvasElement
  }

  interface EventMap {
    click: ExtractParamters<'onClick'>
    load: [map: GenshinMap]
  }
}
