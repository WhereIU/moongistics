import {
  AnimatedSprite,
  Container,
  type ContainerChild,
  type Texture,
} from 'pixi.js';

import type {
  RenderObjectFactory,
} from './RenderObjectFactory';

import type {
  RenderTypeId,
} from '@/game/ecs/components/rendering';

export interface RenderEntityState {
  x: number;
  y: number;
  rotation: number;

  visible: boolean;
  layer: number;

  renderable: {
    type: RenderTypeId;

    frames:
      readonly Texture[];

    frame:
      number;

    tint:
      number | null;
  };
}

interface AppliedRenderState {
  x: number;
  y: number;
  rotation: number;

  visible: boolean;
  layer: number;

  frame: number;
}

export class RenderWorld {
  private readonly container: Container;

  private readonly factory:
    RenderObjectFactory;

  private readonly objects =
    new Map<
      number,
      ContainerChild
    >();

  private readonly states =
    new Map<
      number,
      AppliedRenderState
    >();

  public constructor(
    container: Container,
    factory: RenderObjectFactory,
  ) {
    this.container =
      container;

    this.factory =
      factory;
  }

  public syncEntity(
    entity: number,
    state: RenderEntityState,
  ): void {
    const existingObject =
      this.objects.get(
        entity,
      );

    if (
      existingObject
    ) {
      this.updateObject(
        entity,
        existingObject,
        state,
      );

      return;
    }

    const object =
      this.factory.create(
        state.renderable,
      );

    this.objects.set(
      entity,
      object,
    );

    this.container.addChild(
      object,
    );

    this.updateObject(
      entity,
      object,
      state,
    );
  }

  private updateObject(
    entity: number,
    object: ContainerChild,
    state: RenderEntityState,
  ): void {
    const previous =
      this.states.get(
        entity,
      );

    if (
      !previous ||
      previous.x !== state.x ||
      previous.y !== state.y
    ) {
      object.position.set(
        state.x,
        state.y,
      );
    }

    if (
      !previous ||
      previous.rotation !==
        state.rotation
    ) {
      object.rotation =
        state.rotation;
    }

    if (
      !previous ||
      previous.visible !==
        state.visible
    ) {
      object.visible =
        state.visible;
    }

    if (
      !previous ||
      previous.layer !==
        state.layer
    ) {
      object.zIndex =
        state.layer;
    }

    if (
      object instanceof AnimatedSprite &&
      (
        !previous ||
        previous.frame !==
          state.renderable.frame
      )
    ) {
      if (
        state.renderable.frame >= 0 &&
        state.renderable.frame <
          object.totalFrames
      ) {
        object.gotoAndStop(
          state.renderable.frame,
        );
      }
    }

    this.states.set(
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

        frame:
          state.renderable.frame,
      },
    );
  }

  public setCulled(
    entity: number,
    culled: boolean,
  ): void {
    const object =
      this.objects.get(
        entity,
      );

    if (!object) {
      return;
    }

    const visible =
      !culled;

    const previous =
      this.states.get(
        entity,
      );

    if (
      previous &&
      previous.visible ===
        visible
    ) {
      return;
    }

    object.visible =
      visible;

    if (
      previous
    ) {
      previous.visible =
        visible;
    }
  }

  public removeEntity(
    entity: number,
  ): void {
    const object =
      this.objects.get(
        entity,
      );

    if (!object) {
      return;
    }

    object.removeFromParent();
    object.destroy();

    this.objects.delete(
      entity,
    );

    this.states.delete(
      entity,
    );
  }

  public clear(): void {
    for (
      const object
      of this.objects.values()
    ) {
      object.removeFromParent();
      object.destroy();
    }

    this.objects.clear();
    this.states.clear();
  }

  public removeMissingEntities(
    activeEntities: Set<number>,
  ): void {
    for (
      const entity
      of this.objects.keys()
    ) {
      if (
        activeEntities.has(entity)
      ) {
        continue;
      }

      this.removeEntity(
        entity,
      );
    }
  }

  public getObjectCount(): number {
    return this.objects.size;
  }
}