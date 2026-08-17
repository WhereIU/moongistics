export const RenderType = {
  Sprite: 0,
  Animated: 1,
  Container: 2,
} as const;

export type RenderTypeId =
  (typeof RenderType)[keyof typeof RenderType];

/**
 * Renderer-facing state.
 *
 * Prototype/asset information does not belong here.
 * The visual source is resolved through PrototypeRef.
 */
export const Renderable = {
  type: [] as RenderTypeId[],

  visible: [] as number[],

  layer: [] as number[],
};

/**
 * Marks an entity whose visual state must be synchronized
 * with the rendering world.
 *
 * 1 = dirty
 * 0 = clean
 */
export const RenderDirty = {
  dirty: [] as number[],
};