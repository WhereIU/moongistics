export interface FrameRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SpritesheetGrid {
  frameWidth: number;
  frameHeight: number;
  startY?: number;
  count?: number;
}

export interface BasePrototype {
  type: string;
  id: string;
  name: string;
  textureKey: string;
  textureUrl?: string;
}

export interface TilePrototype extends BasePrototype {
  type: 'tile';
  tint?: number;
  gridConfig?: SpritesheetGrid;
  frames?: FrameRect[];
}

export interface BuildingPrototype extends BasePrototype {
  type: 'structure';
  width: number;
  height: number;
}

export type EntityPrototype = TilePrototype | BuildingPrototype;
