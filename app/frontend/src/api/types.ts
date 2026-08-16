export interface WorldTileData {
  x: number;
  y: number;

  baseType: string;
  visualVariant?: number;

  playable: boolean;
}

export interface WorldData {
  id: string;

  seed: number;

  width: number;
  height: number;

  tileSize: number;

  tiles: WorldTileData[];
}