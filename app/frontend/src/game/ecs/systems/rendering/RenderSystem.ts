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

import type {
  ViewportBounds,
} from '@/features/camera-control/CameraControl';

export class RenderSystem {
  private readonly renderWorld: RenderWorld;
  private readonly cullingMargin: number;

  public constructor(
    renderWorld: RenderWorld,
    tileSize: number,
    cullingTiles: number,
  ) {
    this.renderWorld = renderWorld;

    this.cullingMargin =
      tileSize * cullingTiles;
  }

  public sync(
    world: EcsWorldFacade,
    alpha: number,
    viewport: ViewportBounds,
  ): void {
    const entities =
      queries.renderable(world.raw);

    const activeEntities =
      new Set<number>();

    for (
      const entity of entities
    ) {
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

      /*
       * Culling uses the interpolated render position.
       *
       * The viewport is expanded by the configured
       * number of tile sizes in every direction.
       */
      if (
        !this.isInsideCullingBounds(
          interpolatedX,
          interpolatedY,
          viewport,
        )
      ) {
        continue;
      }

      activeEntities.add(entity);

      const renderable =
        world.getRenderable(entity);

      if (!renderable) {
        continue;
      }

      this.renderWorld.syncEntity(
        entity,
        {
          x: interpolatedX,
          y: interpolatedY,

          rotation:
            Transform.previousRotation[entity] +
            (
              Transform.rotation[entity] -
              Transform.previousRotation[entity]
            ) *
            alpha,

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

    this.renderWorld.removeMissingEntities(
      activeEntities,
    );
  }

  private isInsideCullingBounds(
    x: number,
    y: number,
    viewport: ViewportBounds,
  ): boolean {
    return (
      x >=
        viewport.minX -
        this.cullingMargin &&

      x <=
        viewport.maxX +
        this.cullingMargin &&

      y >=
        viewport.minY -
        this.cullingMargin &&

      y <=
        viewport.maxY +
        this.cullingMargin
    );
  }
}
