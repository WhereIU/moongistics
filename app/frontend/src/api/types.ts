export interface WorldTileData {
  x: number;
  y: number;

  /**
   * ID of the tile prototype used by this world tile.
   */
  prototypeId: string;

  /**
   * Instance-specific static visual variation.
   *
   * The prototype defines which frames are available.
   * The world only selects one of them for this instance.
   */
  variant?: number;

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