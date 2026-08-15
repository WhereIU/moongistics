import type { WorldData } from '@/api/types';

import {
  EcsWorldFacade,
  createEcsWorld,
} from './ecs/world/EcsWorld';

import { SpawnService } from './ecs/spawn/SpawnService';

export class GameWorld {
  public readonly ecs: EcsWorldFacade;
  public readonly data: WorldData;

  private initialized = false;

  public constructor(
    data: WorldData,
  ) {
    this.data = data;

    this.ecs =
      new EcsWorldFacade(
        createEcsWorld(),
      );
  }

  public initialize(): void {
    if (this.initialized) {
      return;
    }

    const spawnService =
      new SpawnService(
        this.ecs,
      );

    for (
      const tile
      of this.data.tiles
    ) {
      spawnService.spawnTile({
        x: tile.x,
        y: tile.y,

        baseType: tile.baseType,
        variant: tile.variant,

        playable: tile.playable,
      });
    }

    this.initialized = true;
  }
}