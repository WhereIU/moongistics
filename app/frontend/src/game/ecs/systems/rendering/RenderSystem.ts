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

    for (
      const entity of entities
    ) {
      /*
       * Existence in ECS is independent from
       * visibility in the current viewport.
       */
      this.renderStateBuffer.markPresent(
        entity,
      );

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
       * Culling affects rendering only.
       *
       * The entity remains present in the buffer
       * even when it is outside the viewport.
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

      const renderable =
        world.getRenderable(entity);

      if (!renderable) {
        continue;
      }

      const interpolatedRotation =
        Transform.previousRotation[entity] +
        (
          Transform.rotation[entity] -
          Transform.previousRotation[entity]
        ) *
        alpha;

      const changed =
        this.renderStateBuffer.update(
          entity,

          interpolatedX,
          interpolatedY,
          interpolatedRotation,

          renderable.visible,
          renderable.layer,

          renderable.type,
          renderable.assetKey,
          renderable.visualVariant,
        );

      if (!changed) {
        continue;
      }

      const state =
        this.renderStateBuffer.get(
          entity,
        );

      if (!state) {
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

    const visibleEntities =
      this.renderStateBuffer
        .getVisibleEntities();

    /*
     * RenderWorld removes Pixi objects that are
     * outside the current culling bounds.
     *
     * Their RenderState remains in the buffer.
     */
    this.renderWorld.removeMissingEntities(
      visibleEntities,
    );

    /*
     * Only actual ECS removal deletes the
     * corresponding RenderState.
     */
    const removedEntities =
      this.renderStateBuffer.endFrame();

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