import type {
  EcsEntity,
  EcsWorldFacade,
} from '../world/EcsWorld';

import {
  PrototypeRegistry,
} from '@/prototypes/registry/PrototypeRegistry';

import {
  isTilePrototype,
} from '@/prototypes/types';

import {
  RenderType,
} from '../components/rendering';

export interface TileSpawnData {
  x: number;
  y: number;

  prototypeId: string;

  variant?: number;

  playable: boolean;
}

export class SpawnService {
  private readonly world: EcsWorldFacade;

  public constructor(
    world: EcsWorldFacade,
  ) {
    this.world =
      world;
  }

  public spawnTile(
    data: TileSpawnData,
  ): EcsEntity {
    const prototype =
      PrototypeRegistry.get(
        'tile',
        data.prototypeId,
      );

    if (
      !isTilePrototype(prototype)
    ) {
      throw new Error(
        `[SpawnService] Prototype is not a tile: tile.${data.prototypeId}`,
      );
    }

    const entity =
      this.world.createEntity();

    this.world.addPosition(
      entity,
      data.x,
      data.y,
    );

    this.world.addPrototypeRef(
      entity,
      prototype.type,
      prototype.id,
    );

    this.world.addVisualVariant(
      entity,
      data.variant ?? 0,
    );

    this.world.addRenderable(
      entity,
      {
        type:
          this.resolveRenderType(
            prototype.render.type,
          ),

        visible:
          true,

        layer:
          0,
      },
    );

    return entity;
  }

  private resolveRenderType(
    type:
      | 'sprite'
      | 'animated'
      | 'container'
      | undefined,
  ) {
    switch (type) {
      case 'animated':
        return RenderType.Animated;

      case 'container':
        return RenderType.Container;

      case 'sprite':
      case undefined:
        return RenderType.Sprite;

      default:
        throw new Error(
          `[SpawnService] Unknown render type: ${String(type)}`,
        );
    }
  }
}