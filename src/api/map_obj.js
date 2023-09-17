import { ref } from "vue";
import { create_map, create_map_tiles } from "./map";

export const map = ref(null);

export const mapDom = ref(null);

export const mapTiles = ref(null);

export const mapOptions = ref({});

export const mapBounds = ref([
  [0, 0],
  [0, 0],
]);

export const createMap = (areaCode = "提瓦特-base0") => {
  const mapConfig = create_map_tiles(areaCode);
  const { tiles } = mapConfig;
  const tilesConfig = mapConfig.tiles_config || {};
  const mapSettings = mapConfig.map_settings || {};
  const mapMaxBounds = mapConfig.map_bounds || [
    [0, 0],
    [0, 0],
  ];
  const currentMapCode = mapOptions.value?.code || "";
  const newMapCode = tilesConfig.code || "";

  let redrawMap = false;
  if (currentMapCode === newMapCode) {
    // 同一张底图，只需要切换视图
    const center = tilesConfig.settings?.center;
    const zoom = tilesConfig.settings?.zoom;
    if (center) {
      map.value?.flyTo(center, zoom);
      mapBounds.value = mapMaxBounds;
    }

    redrawMap = false;
  } else {
    // 不同底图，需要重绘地图
    removeMap();
    const { map: mapObj, tiles: tilesObj } = create_map(mapSettings, tiles);
    mapTiles.value = tilesObj;
    map.value = mapObj;
    mapBounds.value = mapMaxBounds;
    redrawMap = true;
  }

  mapOptions.value = tilesConfig;
  return { redrawMap };
};

export const removeMap = () => {
  map.value?.remove();
};
