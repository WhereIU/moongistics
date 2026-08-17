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
       * the buffer has no visual state yet,
       * therefore ECS Renderable must be read.
       */
      if (isNew) {
        const renderable =
          world.getRenderable(entity);

        if (!renderable) {
          continue;
        }

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
        );

        changed = true;
      } else {
        /*
         * Transform is render-frame data.
         *
         * It must be updated every frame so
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
         * Renderable data is only read from ECS
         * when explicitly marked dirty.
         */
        if (
          world.isRenderDirty(entity)
        ) {
          const renderable =
            world.getRenderable(entity);

          if (renderable) {
            changed =
              this.renderStateBuffer.updateRenderable(
                entity,

                renderable.visible,
                renderable.layer,

                renderable.type,
                renderable.assetKey,
                renderable.visualVariant,
              ) ||
              changed;
          }

          world.clearRenderDirty(
            entity,
          );
        }
      }

      /*
       * An entity returning from culling needs
       * its Pixi object recreated even if its
       * buffered state itself did not change.
       */
      if (returnedToViewport) {
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
          x: state.x,
          y: state.y,
          rotation: state.rotation,

          visible: state.visible,
          layer: state.layer,

          renderable: {
            type: state.type,
            assetKey: state.assetKey,
            visualVariant: state.visualVariant,
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