import {
  queries,
} from '../../queries';

import {
  PrototypeRef,
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

import {
  prototypeVisualResolver,
} from '@/shared/assets/PrototypeVisualResolver';

export class RenderSystem {
  private readonly renderWorld:
    RenderWorld;

  private readonly renderStateBuffer:
    RenderStateBuffer;

  private readonly cullingMargin:
    number;

  public constructor(
    renderWorld: RenderWorld,
    tileSize: number,
    cullingTiles: number,
  ) {
    this.renderWorld =
      renderWorld;

    this.renderStateBuffer =
      new RenderStateBuffer();

    this.cullingMargin =
      tileSize *
      cullingTiles;
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
      const entity
      of entities
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

      const prototypeRef =
        this.getPrototypeRef(
          world,
          entity,
        );

      if (!prototypeRef) {
        continue;
      }

      const visual =
        prototypeVisualResolver.resolve(
          prototypeRef.type as
            'tile' |
            'structure',
          prototypeRef.id,
        );

      const renderable =
        world.getRenderable(
          entity,
        );

      if (!renderable) {
        continue;
      }

      const animation =
        world.getAnimation(
          entity,
        );

      const visualState =
        this.resolveVisualState(
          visual,
          world,
          entity,
          animation,
        );

      if (isNew) {
        this.renderStateBuffer.create(
          entity,

          interpolatedX,
          interpolatedY,
          interpolatedRotation,

          renderable.visible,
          renderable.layer,

          renderable.type,

          visualState.frames,

          visualState.frame,

          visual.tint,
        );

        changed =
          true;
      } else {
        changed =
          this.renderStateBuffer.updateTransform(
            entity,
            interpolatedX,
            interpolatedY,
            interpolatedRotation,
          );

        if (
          world.isRenderDirty(entity)
        ) {
          changed =
            this.renderStateBuffer.updateVisual(
              entity,

              renderable.visible,
              renderable.layer,

              renderable.type,

              visualState.frames,

              visualState.frame,

              visual.tint,
            ) ||
            changed;

          world.clearRenderDirty(
            entity,
          );
        }
      }

      if (
        returnedToViewport
      ) {
        changed =
          true;
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

            frames:
              state.frames,

            frame:
              state.frame,

            tint:
              state.tint,
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

  private getPrototypeRef(
    world: EcsWorldFacade,
    entity: number,
  ): {
    type: string;
    id: string;
  } | null {
    if (
      !world.hasPrototypeRef(entity)
    ) {
      return null;
    }

    return {
      type:
        PrototypeRef.type[entity],

      id:
        PrototypeRef.id[entity],
    };
  }

  private resolveVisualState(
    visual: ReturnType<
      typeof prototypeVisualResolver.resolve
    >,
    world: EcsWorldFacade,
    entity: number,
    animation: ReturnType<
      EcsWorldFacade['getAnimation']
    >,
  ): {
    frames: readonly import('pixi.js').Texture[];
    frame: number;
  } {
    if (
      animation
    ) {
      const resolvedAnimation =
        visual.animations.get(
          animation.id,
        );

      if (!resolvedAnimation) {
        throw new Error(
          `[RenderSystem] Animation "${animation.id}" is not defined by the prototype.`,
        );
      }

      return {
        frames:
          resolvedAnimation.frames,

        frame:
          animation.frame,
      };
    }

    if (
      !visual.staticFrames
    ) {
      throw new Error(
        `[RenderSystem] Entity ${entity} has no animation and its prototype has no static visual.`,
      );
    }

    const variant =
      world.getVisualVariant(
        entity,
      );

    if (
      variant < 0 ||
      variant >=
        visual.staticFrames.length
    ) {
      throw new Error(
        [
          `[RenderSystem] Visual variant ${variant} is outside`,
          `the available range 0..${visual.staticFrames.length - 1}.`,
        ].join(' '),
      );
    }

    return {
      frames:
        visual.staticFrames,

      frame:
        variant,
    };
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