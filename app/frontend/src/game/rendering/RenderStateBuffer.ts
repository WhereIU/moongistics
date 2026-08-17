import type {
  RenderTypeId,
} from '@/game/ecs/components/rendering';

export interface RenderState {
  x: number;
  y: number;
  rotation: number;

  visible: boolean;
  layer: number;

  type: RenderTypeId;
  assetKey: string;
  visualVariant: number;
}

export class RenderStateBuffer {
  private readonly states =
    new Map<number, RenderState>();

  /**
   * Entities that still exist in ECS
   * during the current frame.
   */
  private readonly presentEntities =
    new Set<number>();

  /**
   * Entities currently inside the render culling bounds.
   */
  private readonly visibleEntities =
    new Set<number>();

  /**
   * Entities that were inside the culling bounds
   * during the previous render frame.
   */
  private readonly previousVisibleEntities =
    new Set<number>();

  public beginFrame(): void {
    this.presentEntities.clear();

    this.previousVisibleEntities.clear();

    for (
      const entity
      of this.visibleEntities
    ) {
      this.previousVisibleEntities.add(
        entity,
      );
    }

    this.visibleEntities.clear();
  }

  /**
   * Marks an entity as existing in the ECS.
   *
   * This is intentionally separate from update():
   * an entity may exist in ECS while being outside
   * the current render viewport.
   */
  public markPresent(
    entity: number,
  ): void {
    this.presentEntities.add(
      entity,
    );
  }

  /**
   * Updates the render state of an entity that
   * passed culling.
   *
   * Returns true when RenderWorld needs to receive
   * the state.
   *
   * This is also true when the entity has just
   * returned from outside the culling bounds,
   * even if its state itself did not change.
   */
  public update(
    entity: number,

    x: number,
    y: number,
    rotation: number,

    visible: boolean,
    layer: number,

    type: RenderTypeId,
    assetKey: string,
    visualVariant: number,
  ): boolean {
    this.visibleEntities.add(
      entity,
    );

    const state =
      this.states.get(entity);

    if (!state) {
      this.states.set(
        entity,
        {
          x,
          y,
          rotation,

          visible,
          layer,

          type,
          assetKey,
          visualVariant,
        },
      );

      return true;
    }

    const changed =
      !(
        state.x === x &&
        state.y === y &&
        state.rotation === rotation &&
        state.visible === visible &&
        state.layer === layer &&
        state.type === type &&
        state.assetKey === assetKey &&
        state.visualVariant === visualVariant
      );

    state.x =
      x;

    state.y =
      y;

    state.rotation =
      rotation;

    state.visible =
      visible;

    state.layer =
      layer;

    state.type =
      type;

    state.assetKey =
      assetKey;

    state.visualVariant =
      visualVariant;

    /*
     * The Pixi object may have been removed while
     * the entity was outside the culling bounds.
     *
     * Therefore returning to the viewport is a
     * render change even when the state itself
     * remained unchanged.
     */
    const returnedToViewport =
      !this.previousVisibleEntities.has(
        entity,
      );

    return (
      changed ||
      returnedToViewport
    );
  }

  public get(
    entity: number,
  ): RenderState | undefined {
    return this.states.get(
      entity,
    );
  }

  /**
   * Finishes the frame.
   *
   * Only entities that disappeared from ECS are
   * removed from the buffer.
   *
   * Leaving the viewport does NOT remove the state.
   */
  public endFrame(): number[] {
    const removedEntities: number[] = [];

    for (
      const entity
      of this.states.keys()
    ) {
      if (
        this.presentEntities.has(
          entity,
        )
      ) {
        continue;
      }

      this.states.delete(
        entity,
      );

      removedEntities.push(
        entity,
      );
    }

    return removedEntities;
  }

  /**
   * Returns entities that are inside the current
   * culling bounds.
   */
  public getVisibleEntities(): Set<number> {
    return this.visibleEntities;
  }

  public remove(
    entity: number,
  ): void {
    this.states.delete(
      entity,
    );

    this.presentEntities.delete(
      entity,
    );

    this.visibleEntities.delete(
      entity,
    );

    this.previousVisibleEntities.delete(
      entity,
    );
  }

  public clear(): void {
    this.states.clear();

    this.presentEntities.clear();
    this.visibleEntities.clear();
    this.previousVisibleEntities.clear();
  }

  public has(
    entity: number,
  ): boolean {
    return this.states.has(
      entity,
    );
  }

  public get size(): number {
    return this.states.size;
  }
}