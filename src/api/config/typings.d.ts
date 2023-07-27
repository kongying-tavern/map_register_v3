declare namespace API {
  type ExtraKeys = '1_6_island' | '2_8_island' | 'underground'

  type Coordinate2D = [number, number]

  type Coordinate3D = [number, number, number]

  interface RecursiveOption {
    label: string
    value: string
    children?: RecursiveOption[]
  }

  interface EditorConfig {
    bannerText?: string
    quickInputSnippets?: string[]
    refreshTimeSpecial?: { label: string; value: number }[]
  }

  interface ExtraConfig {
    '1_6_island'?: {
      stages: API.RecursiveOption[]
    }
    '2_8_island'?: {
      stages: API.RecursiveOption[]
    }
    underground?: {
      useDetail?: boolean
      levels?: API.RecursiveOption[]
    }
  }

  interface OverlayConfig {
    overlays?: []
    panelIcon?: string
    /** @template `{{key}}` */
    urlTemplate?: string
  }

  interface PluginConfig {
    extra?: string[]
    extraConfig?: API.ExtraConfig
    overlay?: boolean
    overlayConfig?: API.OverlayConfig
  }

  interface TileConfig {
    code?: string
    extend?: string
    center?: API.Coordinate2D
    extension?: string
    size?: API.Coordinate2D
    settings?: {
      center?: API.Coordinate2D
      zoom?: number
    }
  }

  type DadianJSON = {
    editor?: API.EditorConfig
    plugins?: Record<string, API.PluginConfig>
    tiles?: Record<string, API.TileConfig>
    tilesNeigui?: Record<string, API.TileConfig>
  }
}
