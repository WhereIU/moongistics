import type { GameApi } from '@/api/client';
import type {
  WorldData,
  WorldTileData,
} from '@/api/types';

export class MockWorldApi implements GameApi {
  public async getWorldData(
    _worldId: string,
  ): Promise<WorldData> {
    const width = 32;
    const height = 32;
    const tileSize = 64;

    const tiles: WorldTileData[] = [];

    for (
      let y = 0;
      y < height;
      y++
    ) {
      for (
        let x = 0;
        x < width;
        x++
      ) {
        tiles.push({
          x: x * tileSize,
          y: y * tileSize,

          baseType: 'lunar_regolith',

          variant: Math.floor(
            Math.random() * 16,
          ),

          playable: true,
        });
      }
    }

    return {
      id: 'mock-world',

      seed: 12345,

      width,
      height,

      tileSize,
      tiles,
    };
  }
}