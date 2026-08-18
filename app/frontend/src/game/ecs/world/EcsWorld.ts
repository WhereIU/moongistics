import {
  addComponent,
  addEntity,
  createWorld,
  hasComponent,
  removeComponent,
  removeEntity,
} from 'bitecs';

import { CommandBus } from '../commands/CommandBus';
import { EventBus } from '../events/EventBus';

import {
  Transform,
  Velocity,
  PrototypeRef,
  Renderable,
  RenderDirty,
  VisualVariant,
  VisualAnimation,
  type RenderTypeId,
} from '../components';

export interface EcsClock {
  tick: number;
  simulationTimeSeconds: number;
}

export interface EcsRuntime {
  readonly clock: EcsClock;
  readonly commands: CommandBus;
  readonly events: EventBus;
}

export type EcsEntity = number;

export type RawEcsWorld =
  ReturnType<typeof createWorld>;

export type EcsWorld =
  RawEcsWorld &
  EcsRuntime;

export function createEcsWorld(): EcsWorld {
  return createWorld({
    clock: {
      tick: 0,
      simulationTimeSeconds: 0,
    },

    commands:
      new CommandBus(),

    events:
      new EventBus(),
  }) as EcsWorld;
}

export class EcsWorldFacade {
  public readonly raw: EcsWorld;

  public constructor(
    raw: EcsWorld,
  ) {
    this.raw = raw;
  }

  // ---------------------------------------------------------------------------
  // Entities
  // ---------------------------------------------------------------------------

  public createEntity(): EcsEntity {
    return addEntity(
      this.raw,
    );
  }

  public destroyEntity(
    entity: EcsEntity,
  ): void {
    removeEntity(
      this.raw,
      entity,
    );
  }

  // ---------------------------------------------------------------------------
  // Transform
  // ---------------------------------------------------------------------------

  public addPosition(
    entity: EcsEntity,
    x: number,
    y: number,
    rotation = 0,
  ): void {
    addComponent(
      this.raw,
      entity,
      Transform,
    );

    Transform.x[entity] =
      x;

    Transform.y[entity] =
      y;

    Transform.rotation[entity] =
      rotation;

    Transform.previousX[entity] =
      x;

    Transform.previousY[entity] =
      y;

    Transform.previousRotation[entity] =
      rotation;
  }

  public hasPosition(
    entity: EcsEntity,
  ): boolean {
    return hasComponent(
      this.raw,
      entity,
      Transform,
    );
  }

  public getPosition(
    entity: EcsEntity,
  ): {
    x: number;
    y: number;
    rotation: number;
  } | null {
    if (
      !this.hasPosition(entity)
    ) {
      return null;
    }

    return {
      x:
        Transform.x[entity],

      y:
        Transform.y[entity],

      rotation:
        Transform.rotation[entity],
    };
  }

  // ---------------------------------------------------------------------------
  // Velocity
  // ---------------------------------------------------------------------------

  public addVelocity(
    entity: EcsEntity,
    x = 0,
    y = 0,
  ): void {
    addComponent(
      this.raw,
      entity,
      Velocity,
    );

    Velocity.x[entity] =
      x;

    Velocity.y[entity] =
      y;
  }

  public hasVelocity(
    entity: EcsEntity,
  ): boolean {
    return hasComponent(
      this.raw,
      entity,
      Velocity,
    );
  }

  // ---------------------------------------------------------------------------
  // Prototype
  // ---------------------------------------------------------------------------

  public addPrototypeRef(
    entity: EcsEntity,
    type: string,
    id: string,
  ): void {
    addComponent(
      this.raw,
      entity,
      PrototypeRef,
    );

    PrototypeRef.type[entity] =
      type;

    PrototypeRef.id[entity] =
      id;
  }

  public hasPrototypeRef(
    entity: EcsEntity,
  ): boolean {
    return hasComponent(
      this.raw,
      entity,
      PrototypeRef,
    );
  }

  public getPrototypeRef(
    entity: EcsEntity,
  ): {
    type: string;
    id: string;
  } | null {
    if (
      !this.hasPrototypeRef(entity)
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

  // ---------------------------------------------------------------------------
  // Visual variant
  // ---------------------------------------------------------------------------

  public addVisualVariant(
    entity: EcsEntity,
    index = 0,
  ): void {
    addComponent(
      this.raw,
      entity,
      VisualVariant,
    );

    VisualVariant.index[entity] =
      index;
  }

  public hasVisualVariant(
    entity: EcsEntity,
  ): boolean {
    return hasComponent(
      this.raw,
      entity,
      VisualVariant,
    );
  }

  public getVisualVariant(
    entity: EcsEntity,
  ): number {
    if (
      !this.hasVisualVariant(entity)
    ) {
      return 0;
    }

    return VisualVariant.index[entity];
  }

  public setVisualVariant(
    entity: EcsEntity,
    index: number,
  ): void {
    if (!this.hasVisualVariant(entity)) {
      this.addVisualVariant(entity, index);
    } else if (VisualVariant.index[entity] !== index) {
      VisualVariant.index[entity] = index;
    }

    if (this.hasRenderable(entity)) {
      this.markRenderDirty(entity);
    }
  }

  // ---------------------------------------------------------------------------
  // Renderable
  // ---------------------------------------------------------------------------

  public addRenderable(
    entity: EcsEntity,
    data: {
      type: RenderTypeId;
      visible?: boolean;
      layer?: number;
    },
  ): void {
    addComponent(
      this.raw,
      entity,
      Renderable,
    );

    addComponent(
      this.raw,
      entity,
      RenderDirty,
    );

    Renderable.type[entity] =
      data.type;

    Renderable.visible[entity] =
      data.visible === false
        ? 0
        : 1;

    Renderable.layer[entity] =
      data.layer ?? 0;

    RenderDirty.dirty[entity] =
      1;
  }

  public hasRenderable(
    entity: EcsEntity,
  ): boolean {
    return hasComponent(
      this.raw,
      entity,
      Renderable,
    );
  }

  public getRenderable(
    entity: EcsEntity,
  ): {
    type: RenderTypeId;
    visible: boolean;
    layer: number;
  } | null {
    if (
      !this.hasRenderable(entity)
    ) {
      return null;
    }

    return {
      type:
        Renderable.type[entity],

      visible:
        Renderable.visible[entity] !== 0,

      layer:
        Renderable.layer[entity],
    };
  }

  public setRenderable(
    entity: EcsEntity,
    data: {
      type?: RenderTypeId;
      visible?: boolean;
      layer?: number;
    },
  ): void {
    if (!this.hasRenderable(entity)) {
      this.addRenderable(entity, data as { type: RenderTypeId; visible?: boolean; layer?: number });
      return;
    }

    let changed = false;

    if (data.type !== undefined && Renderable.type[entity] !== data.type) {
      Renderable.type[entity] = data.type;
      changed = true;
    }

    if (data.visible !== undefined) {
      const value = data.visible ? 1 : 0;
      if (Renderable.visible[entity] !== value) {
        Renderable.visible[entity] = value;
        changed = true;
      }
    }

    if (data.layer !== undefined && Renderable.layer[entity] !== data.layer) {
      Renderable.layer[entity] = data.layer;
      changed = true;
    }

    if (changed) {
      this.markRenderDirty(entity);
    }
  }

  public removeRenderable(
    entity: EcsEntity,
  ): void {
    if (
      !this.hasRenderable(entity)
    ) {
      return;
    }

    if (
      this.hasRenderDirty(entity)
    ) {
      removeComponent(
        this.raw,
        entity,
        RenderDirty,
      );
    }

    removeComponent(
      this.raw,
      entity,
      Renderable,
    );
  }

  // ---------------------------------------------------------------------------
  // Animation
  // ---------------------------------------------------------------------------

  public addAnimation(
    entity: EcsEntity,
    data: {
      id: string;
      frame?: number;
      playing?: boolean;
    },
  ): void {
    addComponent(
      this.raw,
      entity,
      VisualAnimation,
    );

    VisualAnimation.id[entity] =
      data.id;

    VisualAnimation.frame[entity] =
      data.frame ?? 0;

    VisualAnimation.elapsedSeconds[entity] =
      0;

    VisualAnimation.playing[entity] =
      data.playing === false
        ? 0
        : 1;

    if (
      this.hasRenderable(entity)
    ) {
      this.markRenderDirty(entity);
    }
  }

  public hasAnimation(
    entity: EcsEntity,
  ): boolean {
    return hasComponent(
      this.raw,
      entity,
      VisualAnimation,
    );
  }

  public getAnimation(
    entity: EcsEntity,
  ): {
    id: string;
    frame: number;
    elapsedSeconds: number;
    playing: boolean;
  } | null {
    if (
      !this.hasAnimation(entity)
    ) {
      return null;
    }

    return {
      id:
        VisualAnimation.id[entity],

      frame:
        VisualAnimation.frame[entity],

      elapsedSeconds:
        VisualAnimation.elapsedSeconds[entity],

      playing:
        VisualAnimation.playing[entity] !== 0,
    };
  }

  // ---------------------------------------------------------------------------
  // Render dirty
  // ---------------------------------------------------------------------------

  public hasRenderDirty(
    entity: EcsEntity,
  ): boolean {
    return hasComponent(
      this.raw,
      entity,
      RenderDirty,
    );
  }

  public markRenderDirty(
    entity: EcsEntity,
  ): void {
    if (
      !this.hasRenderDirty(entity)
    ) {
      return;
    }

    RenderDirty.dirty[entity] =
      1;
  }

  public clearRenderDirty(
    entity: EcsEntity,
  ): void {
    if (
      !this.hasRenderDirty(entity)
    ) {
      return;
    }

    RenderDirty.dirty[entity] =
      0;
  }

  public isRenderDirty(
    entity: EcsEntity,
  ): boolean {
    return (
      this.hasRenderDirty(entity) &&
      RenderDirty.dirty[entity] === 1
    );
  }
}