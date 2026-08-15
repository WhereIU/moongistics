import type {
  EcsEntity,
  EcsWorldFacade,
} from '../world/EcsWorld';

import {
  RenderType,
} from '../components/rendering';

export interface TileSpawnData {
  x: number;
  y: number;
  baseType: string;
  variant: number;
  playable: boolean;
}

export class SpawnService {
  private readonly world: EcsWorldFacade;

  public constructor(world: EcsWorldFacade) {
    this.world = world;
  }

  public spawnTile(
    data: TileSpawnData,
  ): EcsEntity {
    const entity =
      this.world.createEntity();

    this.world.addPosition(
      entity,
      data.x,
      data.y,
    );

    this.world.addRenderable(
      entity,
      {
        type: RenderType.Sprite,
        assetKey: data.baseType,
      },
    );

    return entity;
  }
}