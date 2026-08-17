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

  private readonly activeEntities =
    new Set<number>();

  /**
   * Starts a new render frame.
   *
   * Entities that are not touched during this frame
   * will be removed in endFrame().
   */
  public beginFrame(): void {
    this.activeEntities.clear();
  }

  /**
   * Updates the buffered render state.
   *
   * Returns true when the state actually changed
   * or the entity did not exist in the buffer yet.
   *
   * Returns false when the existing render state
   * can be reused as-is.
   */
  public update(
    entity: number,
    state: RenderState,
  ): boolean {
    this.activeEntities.add(
      entity,
    );

    const previous =
      this.states.get(entity);

    if (!previous) {
      this.states.set(
        entity,
        {
          ...state,
        },
      );

      return true;
    }

    if (
      previous.x === state.x &&
      previous.y === state.y &&
      previous.rotation === state.rotation &&
      previous.visible === state.visible &&
      previous.layer === state.layer &&
      previous.type === state.type &&
      previous.assetKey === state.assetKey &&
      previous.visualVariant === state.visualVariant
    ) {
      return false;
    }

    previous.x =
      state.x;

    previous.y =
      state.y;

    previous.rotation =
      state.rotation;

    previous.visible =
      state.visible;

    previous.layer =
      state.layer;

    previous.type =
      state.type;

    previous.assetKey =
      state.assetKey;

    previous.visualVariant =
      state.visualVariant;

    return true;
  }

  /**
   * Returns the currently buffered state.
   */
  public get(
    entity: number,
  ): RenderState | undefined {
    return this.states.get(
      entity,
    );
  }

  /**
   * Removes entities that were not active
   * during the current render frame.
   *
   * Returns the removed entity ids.
   */
  public endFrame(): number[] {
    const removedEntities: number[] = [];

    for (
      const entity
      of this.states.keys()
    ) {
      if (
        this.activeEntities.has(entity)
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

  public remove(
    entity: number,
  ): void {
    this.states.delete(
      entity,
    );

    this.activeEntities.delete(
      entity,
    );
  }

  public clear(): void {
    this.states.clear();
    this.activeEntities.clear();
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