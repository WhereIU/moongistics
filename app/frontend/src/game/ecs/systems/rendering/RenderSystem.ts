import {
  queries,
} from '../../queries';

import {
  Transform,
} from '../../components';

import type {
  EcsWorldFacade,
} from '../../world/EcsWorld';

import {
  RenderWorld,
} from '@/game/rendering/RenderWorld';

export class RenderSystem {
  private readonly renderWorld: RenderWorld;

  public constructor(
    renderWorld: RenderWorld,
  ) {
    this.renderWorld = renderWorld;
  }

  public sync(
    world: EcsWorldFacade,
    alpha: number,
  ): void {
    const entities =
      queries.renderable(world.raw);

    const activeEntities =
      new Set<number>(entities);

    this.renderWorld.removeMissingEntities(
      activeEntities,
    );

    for (
      const entity of entities
    ) {
      const position =
        world.getPosition(entity);

      const renderable =
        world.getRenderable(entity);

      if (
        !position ||
        !renderable
      ) {
        continue;
      }

      const interpolatedX =
        Transform.previousX[entity] +
        (
          Transform.x[entity] -
          Transform.previousX[entity]
        ) *
        alpha;

      const interpolatedY =
        Transform.previousY[entity] +
        (
          Transform.y[entity] -
          Transform.previousY[entity]
        ) *
        alpha;

      const interpolatedRotation =
        Transform.previousRotation[entity] +
        (
          Transform.rotation[entity] -
          Transform.previousRotation[entity]
        ) *
        alpha;

      this.renderWorld.syncEntity(
        entity,
        {
          x: interpolatedX,
          y: interpolatedY,
          rotation: interpolatedRotation,

          visible:
            renderable.visible,

          layer:
            renderable.layer,

          renderable: {
            type:
              renderable.type,

            assetKey:
              renderable.assetKey,

            visualVariant:
              renderable.visualVariant,
          },
        },
      );

      if (
        world.isRenderDirty(entity)
      ) {
        world.clearRenderDirty(entity);
      }
    }
  }
}