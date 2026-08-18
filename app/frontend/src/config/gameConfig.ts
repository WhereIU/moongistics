/**
 * Client-side defaults and tuning values.
 *
 * These are not player state and not world data. Player-editable values are
 * represented separately by UserSettings and can later be supplied by Django.
 */
export const gameConfig = {
  camera: {
    minScale: 0.6,
    maxScale: 1.8,
    boundsRadius: 1200,
    moveSpeed: 720,
    zoomStep: 1.1,
  },

  simulation: {
    updatesPerSecond: 20,
    maxTicksPerFrame: 5,
  },

  rendering: {
    backgroundColor: 0x0a0a0c,
    cullingTiles: 1,
    layers: {
      tile: 0,
      structure: 10,
      unit: 20,
      effect: 30,
      uiWorld: 100,
    },
    defaultLayerByPrototypeType: {
      tile: 0,
      structure: 10,
    },
  },
} as const;

export type GameConfig = typeof gameConfig;
