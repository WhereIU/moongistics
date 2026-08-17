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

import {
  RenderStateBuffer,
  type RenderState,
} from '@/game/rendering/RenderStateBuffer';

import type {
  ViewportBounds,
} from '@/features/camera-control/CameraControl';

export class RenderSystem {
  private readonly renderWorld: RenderWorld;

  private readonly renderStateBuffer:
    RenderStateBuffer;

  private readonly cullingMargin: number;

  public constructor(
    renderWorld: RenderWorld,
    tileSize: number,
    cullingTiles: number,
  ) {
    this.renderWorld = renderWorld;

    this.renderStateBuffer =
      new RenderStateBuffer();

    this.cullingMargin =
      tileSize * cullingTiles;
  }

  public sync(
    world: EcsWorldFacade,
    alpha: number,
    viewport: ViewportBounds,
  ): void {
    const entities =
      queries.renderable(
        world.raw,
      );

    this.renderStateBuffer.beginFrame();

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
       * Culling happens before the entity
       * enters the active render state.
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

      activeEntities.add(
        entity,
      );

      const renderable =
        world.getRenderable(entity);

      if (!renderable) {
        continue;
      }

      const state: RenderState = {
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

        type:
          renderable.type,

        assetKey:
          renderable.assetKey,

        visualVariant:
          renderable.visualVariant,
      };

      const changed =
        this.renderStateBuffer.update(
          entity,
          state,
        );

      /*
       * Static / unchanged entities stop here.
       *
       * Moving entities, newly created entities,
       * visibility changes, layer changes, etc.
       * continue into RenderWorld.
       */
      if (!changed) {
        continue;
      }

      this.renderWorld.syncEntity(
        entity,
        {
          x:
            state.x,

          y:
            state.y,

          rotation:
            state.rotation,

          visible:
            state.visible,

          layer:
            state.layer,

          renderable: {
            type:
              state.type,

            assetKey:
              state.assetKey,

            visualVariant:
              state.visualVariant,
          },
        },
      );

      if (
        world.isRenderDirty(entity)
      ) {
        world.clearRenderDirty(
          entity,
        );
      }
    }

    const removedEntities =
      this.renderStateBuffer.endFrame();

    /*
     * RenderWorld owns Pixi display objects,
     * therefore it must remove objects that
     * are no longer inside the active render set.
     */
    this.renderWorld.removeMissingEntities(
      activeEntities,
    );

    /*
     * Keep the buffer cleanup explicit as well.
     *
     * Normally endFrame() already removed these,
     * but this makes the ownership relationship clear.
     */
    for (
      const entity
      of removedEntities
    ) {
      this.renderWorld.removeEntity(
        entity,
      );
    }
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