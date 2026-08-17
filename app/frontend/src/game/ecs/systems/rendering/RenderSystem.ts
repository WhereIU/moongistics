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

      if (
        !this.isInsideCullingBounds(
          interpolatedX,
          interpolatedY,
          viewport,
        )
      ) {
        continue;
      }

      const returnedToViewport =
        this.renderStateBuffer.markVisible(
          entity,
        );

      const interpolatedRotation =
        Transform.previousRotation[entity] +
        (
          Transform.rotation[entity] -
          Transform.previousRotation[entity]
        ) *
        alpha;

      const isNew =
        !this.renderStateBuffer.has(
          entity,
        );

      let changed =
        false;

      /*
       * New entity:
       *
       * The buffer has no state yet, so ECS
       * render data must be read regardless
       * of RenderDirty.
       */
      if (isNew) {
        const renderable =
          world.getRenderable(entity);

        if (!renderable) {
          continue;
        }

        const animation =
          world.getAnimation(entity);

        this.renderStateBuffer.create(
          entity,

          interpolatedX,
          interpolatedY,
          interpolatedRotation,

          renderable.visible,
          renderable.layer,

          renderable.type,
          renderable.assetKey,
          renderable.visualVariant,

          animation?.frame ?? 0,
        );

        changed = true;
      } else {
        /*
         * Transform is render-frame data.
         *
         * It is updated every render frame so
         * interpolation remains smooth.
         */
        changed =
          this.renderStateBuffer.updateTransform(
            entity,
            interpolatedX,
            interpolatedY,
            interpolatedRotation,
          );

        /*
         * Renderable and Animation are event-like
         * visual state.
         *
         * ECS is only read when the entity is dirty.
         */
        if (
          world.isRenderDirty(entity)
        ) {
          const renderable =
            world.getRenderable(entity);

          if (renderable) {
            const animation =
              world.getAnimation(entity);

            changed =
              this.renderStateBuffer.updateRenderable(
                entity,

                renderable.visible,
                renderable.layer,

                renderable.type,
                renderable.assetKey,
                renderable.visualVariant,

                animation?.frame ?? 0,
              ) ||
              changed;
          }

          world.clearRenderDirty(
            entity,
          );
        }
      }

      /*
       * RenderWorld may have destroyed the Pixi
       * object while this entity was outside
       * the culling bounds.
       *
       * Its buffered state is still valid, so
       * returning to the viewport forces a sync.
       */
      if (
        returnedToViewport
      ) {
        changed = true;
      }

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

            animationFrame:
              state.animationFrame,
          },
        },
      );
    }

    const visibleEntities =
      this.renderStateBuffer
        .getVisibleEntities();

    this.renderWorld.removeMissingEntities(
      visibleEntities,
    );

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