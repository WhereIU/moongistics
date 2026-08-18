import { gameConfig } from '@/config/gameConfig';
import type { PrototypeType } from '@/prototypes/types';
import type { EcsEntity, EcsWorldFacade } from '../world/EcsWorld';

import {
  EntityFactory,
} from './EntityFactory';

export interface TileSpawnData {
  x: number;
  y: number;

  prototypeId: string;

  variant?: number;

  playable: boolean;
}

export class SpawnService {
  private readonly factory:
    EntityFactory;

  public constructor(
    world: EcsWorldFacade,
  ) {
    this.factory =
      new EntityFactory(world);
  }

  public spawnTile(
    data: TileSpawnData,
  ): EcsEntity {
    return this.factory.create({
      type: 'tile',
      id: data.prototypeId,
      x: data.x,
      y: data.y,
      variant: data.variant,
      layer:
        gameConfig.rendering.defaultLayerByPrototypeType.tile,
    });
  }

  public spawn(data: {
    type: PrototypeType;
    id: string;
    x: number;
    y: number;
    variant?: number;
    layer?: number;
  }): EcsEntity {
    return this.factory.create(data);
  }
}
