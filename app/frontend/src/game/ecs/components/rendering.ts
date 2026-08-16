export const RenderType = {
  Sprite: 0,
  Animated: 1,
  Container: 2,
} as const;

export type RenderTypeId =
  (typeof RenderType)[keyof typeof RenderType];

export const Renderable = {
  assetKey: [] as string[],
  visualVariant: [] as number[],
  type: [] as RenderTypeId[],
  visible: [] as number[],
  layer: [] as number[],
};

/**
 * Marks an entity whose visual state must be synchronized
 * with the rendering world.
 *
 * 1 = dirty, render state is outdated
 * 0 = clean, render state is synchronized
 */
export const RenderDirty = {
  dirty: [] as number[],
};

export const Animation = {
  frame: [] as number[],
  frameCount: [] as number[],
  fps: [] as number[],
  elapsedSeconds: [] as number[],
  playing: [] as number[],
  loop: [] as number[],
};