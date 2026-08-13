export interface MapTileData {
  gx: number;
  gy: number;
  x: number;
  y: number;
  baseType: string;
  variant?: number;
  isPlayable: boolean;
}

export interface GameWorldData {
  tiles: MapTileData[];
  playableRadius: number;
  totalRadius: number;
  tileSize: number;
}

export class MockApiService {
  public static async getSectorData(): Promise<GameWorldData> {
    const tiles: MapTileData[] = [];
    const tileSize = 64;
    
    const playableRadius = 15;
    const totalRadius = 22;

    for (let gy = -totalRadius; gy <= totalRadius; gy++) {
      for (let gx = -totalRadius; gx <= totalRadius; gx++) {
        const isPlayable = Math.abs(gx) <= playableRadius && Math.abs(gy) <= playableRadius;

        tiles.push({
          gx,
          gy,
          x: gx * tileSize,
          y: gy * tileSize,
          baseType: 'lunar_regolith',
          variant: Math.floor(Math.random() * 16),
          isPlayable,
        });
      }
    }

    return {
      tiles,
      playableRadius,
      totalRadius,
      tileSize,
    };
  }
}