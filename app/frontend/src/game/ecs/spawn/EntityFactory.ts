import type { EntityPrototype, PrototypeType } from '@/prototypes/types';
import { PrototypeRegistry } from '@/prototypes/registry/PrototypeRegistry';
import { prototypeVisualResolver } from '@/shared/assets/PrototypeVisualResolver';
import type { EcsEntity, EcsWorldFacade } from '../world/EcsWorld';

export interface EntityCreateData {
  type: PrototypeType;
  id: string;
  x: number;
  y: number;
  variant?: number;
  layer?: number;
}

export interface EntityFactoryContext {
  readonly world: EcsWorldFacade;
  readonly entity: EcsEntity;
  readonly prototype: EntityPrototype;
  readonly data: EntityCreateData;
}

export type EntityInitializer = (context: EntityFactoryContext) => void;

function registrationKey(type: PrototypeType, id?: string): string {
  return id === undefined ? `${type}:*` : `${type}:${id}`;
}

/**
 * Composes ECS entities from prototype identity.
 * Common composition lives here; optional composition is registered externally.
 */
export class EntityFactory {
  private readonly world: EcsWorldFacade;
  private readonly initializers = new Map<string, EntityInitializer>();

  public constructor(world: EcsWorldFacade) {
    this.world = world;
  }

  public register(type: PrototypeType, initializer: EntityInitializer): void;
  public register(type: PrototypeType, id: string, initializer: EntityInitializer): void;
  public register(
    type: PrototypeType,
    idOrInitializer: string | EntityInitializer,
    maybeInitializer?: EntityInitializer,
  ): void {
    const id = typeof idOrInitializer === 'string' ? idOrInitializer : undefined;
    const initializer = typeof idOrInitializer === 'function' ? idOrInitializer : maybeInitializer;

    if (!initializer) {
      throw new Error('[EntityFactory] Initializer is required.');
    }

    const key = registrationKey(type, id);
    if (this.initializers.has(key)) {
      throw new Error(`[EntityFactory] Initializer already registered for ${key}.`);
    }

    this.initializers.set(key, initializer);
  }

  public unregister(type: PrototypeType, id?: string): boolean {
    return this.initializers.delete(registrationKey(type, id));
  }

  public create(data: EntityCreateData): EcsEntity {
    const prototype = PrototypeRegistry.get(data.type, data.id);
    const visual = prototypeVisualResolver.resolve(prototype.type, prototype.id);
    const entity = this.world.createEntity();

    this.world.addPosition(entity, data.x, data.y);
    this.world.addPrototypeRef(entity, prototype.type, prototype.id);

    if (data.variant !== undefined) {
      this.world.addVisualVariant(entity, data.variant);
    }

    this.world.addRenderable(entity, {
      type: visual.type,
      visible: true,
      layer: data.layer ?? 0,
    });

    const initializer =
      this.initializers.get(registrationKey(prototype.type, prototype.id)) ??
      this.initializers.get(registrationKey(prototype.type));

    initializer?.({
      world: this.world,
      entity,
      prototype,
      data,
    });

    return entity;
  }
}
