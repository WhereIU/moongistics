import {
  Container,
  type ContainerChild,
} from 'pixi.js';

import type { RenderObjectFactory } from './RenderObjectFactory';

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
    assetKey: string;
    variant?: number;
  };
}

export class RenderWorld {
  private readonly container: Container;
  private readonly factory: RenderObjectFactory;

  private readonly objects =
    new Map<number, ContainerChild>();

  public constructor(
    container: Container,
    factory: RenderObjectFactory,
  ) {
    this.container = container;
    this.factory = factory;
  }

  public syncEntity(
    entity: number,
    state: RenderEntityState,
  ): void {
    const existingObject =
      this.objects.get(entity);

    if (existingObject) {
      this.updateObject(
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
      object,
      state,
    );
  }

  private updateObject(
    object: ContainerChild,
    state: RenderEntityState,
  ): void {
    object.position.set(
      state.x,
      state.y,
    );

    object.rotation =
      state.rotation;

    object.visible =
      state.visible;

    object.zIndex =
      state.layer;
  }

  public removeEntity(
    entity: number,
  ): void {
    const object =
      this.objects.get(entity);

    if (!object) {
      return;
    }

    object.removeFromParent();
    object.destroy();

    this.objects.delete(entity);
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
  }
}