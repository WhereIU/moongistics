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
  Animation,
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
  RawEcsWorld & EcsRuntime;

export function createEcsWorld(): EcsWorld {
  return createWorld({
    clock: {
      tick: 0,
      simulationTimeSeconds: 0,
    },

    commands: new CommandBus(),
    events: new EventBus(),
  }) as EcsWorld;
}

/**
 * Application-level facade over bitECS.
 *
 * Game code works with this class instead of directly manipulating
 * the bitECS world.
 */
export class EcsWorldFacade {
  public readonly raw: EcsWorld;

  public constructor(raw: EcsWorld) {
    this.raw = raw;
  }

  // ---------------------------------------------------------------------------
  // Entities
  // ---------------------------------------------------------------------------

  public createEntity(): EcsEntity {
    return addEntity(this.raw);
  }

  public destroyEntity(entity: EcsEntity): void {
    removeEntity(this.raw, entity);
  }

  // ---------------------------------------------------------------------------
  // Components
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

    Transform.x[entity] = x;
    Transform.y[entity] = y;
    Transform.rotation[entity] = rotation;
  }

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

    Velocity.x[entity] = x;
    Velocity.y[entity] = y;
  }

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

    PrototypeRef.type[entity] = type;
    PrototypeRef.id[entity] = id;
  }

  public addRenderable(
    entity: EcsEntity,
    data: {
      type: RenderTypeId;
      assetKey: string;
      visualVariant?: number;
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

    Renderable.assetKey[entity] =
      data.assetKey;

    Renderable.visualVariant[entity] =
      data.visualVariant ?? 0;

    Renderable.visible[entity] =
      data.visible === false ? 0 : 1;

    Renderable.layer[entity] =
      data.layer ?? 0;

    /*
     * The entity has just received a Renderable,
     * but RenderWorld does not have its object yet.
     */
    RenderDirty.dirty[entity] = 1;
  }

  public addAnimation(
    entity: EcsEntity,
    data: {
      frameCount: number;
      fps: number;
      frame?: number;
      playing?: boolean;
      loop?: boolean;
    },
  ): void {
    addComponent(
      this.raw,
      entity,
      Animation,
    );

    Animation.frame[entity] =
      data.frame ?? 0;

    Animation.frameCount[entity] =
      data.frameCount;

    Animation.fps[entity] =
      data.fps;

    Animation.elapsedSeconds[entity] =
      0;

    Animation.playing[entity] =
      data.playing === false ? 0 : 1;

    Animation.loop[entity] =
      data.loop === false ? 0 : 1;

    /*
     * Adding animation changes the visual state
     * of an already-renderable entity.
     */
    if (this.hasRenderable(entity)) {
      this.markRenderDirty(entity);
    }
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
    if (!this.hasRenderDirty(entity)) {
      return;
    }

    RenderDirty.dirty[entity] = 1;
  }

  public clearRenderDirty(
    entity: EcsEntity,
  ): void {
    if (!this.hasRenderDirty(entity)) {
      return;
    }

    RenderDirty.dirty[entity] = 0;
  }

  public isRenderDirty(
    entity: EcsEntity,
  ): boolean {
    return (
      this.hasRenderDirty(entity) &&
      RenderDirty.dirty[entity] === 1
    );
  }

  // ---------------------------------------------------------------------------
  // Component checks
  // ---------------------------------------------------------------------------

  public hasPosition(
    entity: EcsEntity,
  ): boolean {
    return hasComponent(
      this.raw,
      entity,
      Transform,
    );
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

  public hasRenderable(
    entity: EcsEntity,
  ): boolean {
    return hasComponent(
      this.raw,
      entity,
      Renderable,
    );
  }

  public hasAnimation(
    entity: EcsEntity,
  ): boolean {
    return hasComponent(
      this.raw,
      entity,
      Animation,
    );
  }

  // ---------------------------------------------------------------------------
  // Component removal
  // ---------------------------------------------------------------------------

  public removeRenderable(
    entity: EcsEntity,
  ): void {
    if (!this.hasRenderable(entity)) {
      return;
    }

    if (this.hasRenderDirty(entity)) {
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
  // Component data access
  // ---------------------------------------------------------------------------

  public getPosition(
    entity: EcsEntity,
  ): {
    x: number;
    y: number;
    rotation: number;
  } | null {
    if (!this.hasPosition(entity)) {
      return null;
    }

    return {
      x: Transform.x[entity],
      y: Transform.y[entity],
      rotation: Transform.rotation[entity],
    };
  }

  public getRenderable(
    entity: EcsEntity,
  ): {
    type: RenderTypeId;
    assetKey: string;
    visualVariant: number;
    visible: boolean;
    layer: number;
  } | null {
    if (!this.hasRenderable(entity)) {
      return null;
    }

    return {
      type: Renderable.type[entity],
      assetKey: Renderable.assetKey[entity],
      visualVariant:
        Renderable.visualVariant[entity],
      visible:
        Renderable.visible[entity] !== 0,
      layer:
        Renderable.layer[entity],
    };
  }
}