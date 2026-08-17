/**
 * Instance-specific static visual variation.
 *
 * The prototype defines which frames exist.
 * This component selects one of those frames
 * for this particular entity.
 */
export const VisualVariant = {
  index: [] as number[],
};

/**
 * Current named animation state of an entity.
 *
 * The animation definition itself belongs to the prototype.
 * ECS only stores the runtime state.
 */
export const VisualAnimation = {
  id: [] as string[],

  frame: [] as number[],

  elapsedSeconds: [] as number[],

  playing: [] as number[],
};