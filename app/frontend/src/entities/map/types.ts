export interface TileData {
  q: number;
  r: number;
  baseType: string;
  variant: number;
  obstacleId?: string | null;
  roadLevel?: number;
  isPlayable: boolean;
}

export interface GameWorldData {
  id: string;
  seed: number;
  width: number;
  height: number;
  tiles: TileData[];
}

