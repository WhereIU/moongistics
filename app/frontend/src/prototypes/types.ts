export interface FrameRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SpritesheetGrid {
  frameWidth: number;
  frameHeight: number;
  startX?: number;
  startY?: number;
  count?: number;
}

/**
 * Describes where visual data comes from.
 *
 * The actual asset is loaded by the asset layer.
 * Prototypes only describe the source.
 */
export interface AssetSource {
  url: string;
  key?: string;
}

/**
 * Describes how a source image is split into frames.
 *
 * Either a regular grid or explicit frame rectangles
 * can be used.
 */
export interface FrameSetDefinition {
  source: AssetSource;

  grid?: SpritesheetGrid;
  frames?: FrameRect[];
}

/**
 * A reusable animation definition.
 *
 * Animation only describes which frames are used and
 * how they should be played.
 *
 * Runtime state such as current frame / elapsed time
 * belongs to ECS and is intentionally not here.
 */
export interface AnimationDefinition {
  frames: FrameSetDefinition;

  fps: number;
  loop?: boolean;
}

/**
 * Visual definition for a prototype.
 */
export interface PrototypeRenderConfig {
  type?: RenderType;

  /**
   * Static visual.
   *
   * Used when the prototype has one non-animated
   * visual representation.
   */
  static?: FrameSetDefinition;

  /**
   * Named animations.
   *
   * A prototype may have any number of independent
   * animation states.
   */
  animations?: Record<string, AnimationDefinition>;

  /**
   * Optional tint applied by the renderer.
   */
  tint?: number;
}

export type RenderType =
  | 'sprite'
  | 'animated'
  | 'container';

export type PrototypeType =
  | 'tile'
  | 'structure';

export interface BasePrototype {
  type: PrototypeType;
  id: string;
  name: string;
  render?: PrototypeRenderConfig;
}

export interface TilePrototype
  extends BasePrototype {
  type: 'tile';

  /**
   * Tiles normally use a static FrameSet.
   *
   * Keeping the render definition here instead of
   * having tile-specific gridConfig/frames means tiles
   * use the same asset pipeline as animations.
   */
  render: PrototypeRenderConfig;
}

export interface BuildingPrototype
  extends BasePrototype {
  type: 'structure';

  width: number;
  height: number;

  render?: PrototypeRenderConfig;
}

export type EntityPrototype =
  | TilePrototype
  | BuildingPrototype;

export function isTilePrototype(
  prototype: BasePrototype,
): prototype is TilePrototype {
  return prototype.type === 'tile';
}

export function isBuildingPrototype(
  prototype: BasePrototype,
): prototype is BuildingPrototype {
  return prototype.type === 'structure';
}