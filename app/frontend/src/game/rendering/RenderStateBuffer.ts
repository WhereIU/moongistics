import type {
  Texture,
} from 'pixi.js';

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

  frames:
    readonly Texture[];

  frame:
    number;

  tint:
    number | null;
}

export class RenderStateBuffer {
  private readonly states =
    new Map<
      number,
      RenderState
    >();

  private readonly presentEntities =
    new Set<number>();

  private readonly visibleEntities =
    new Set<number>();

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

  public markPresent(
    entity: number,
  ): void {
    this.presentEntities.add(
      entity,
    );
  }

  public updateTransform(
    entity: number,
    x: number,
    y: number,
    rotation: number,
  ): boolean {
    const state =
      this.states.get(
        entity,
      );

    if (!state) {
      return false;
    }

    const changed =
      state.x !== x ||
      state.y !== y ||
      state.rotation !== rotation;

    state.x =
      x;

    state.y =
      y;

    state.rotation =
      rotation;

    return changed;
  }

  public updateVisual(
    entity: number,
    visible: boolean,
    layer: number,
    type: RenderTypeId,
    frames: readonly Texture[],
    frame: number,
    tint: number | null,
  ): boolean {
    const state =
      this.states.get(
        entity,
      );

    if (!state) {
      return false;
    }

    const changed =
      state.visible !== visible ||
      state.layer !== layer ||
      state.type !== type ||
      state.frames !== frames ||
      state.frame !== frame ||
      state.tint !== tint;

    state.visible =
      visible;

    state.layer =
      layer;

    state.type =
      type;

    state.frames =
      frames;

    state.frame =
      frame;

    state.tint =
      tint;

    return changed;
  }

  public create(
    entity: number,
    x: number,
    y: number,
    rotation: number,
    visible: boolean,
    layer: number,
    type: RenderTypeId,
    frames: readonly Texture[],
    frame: number,
    tint: number | null,
  ): void {
    this.states.set(
      entity,
      {
        x,
        y,
        rotation,

        visible,
        layer,

        type,

        frames,

        frame,

        tint,
      },
    );
  }

  public markVisible(
    entity: number,
  ): boolean {
    this.visibleEntities.add(
      entity,
    );

    return (
      !this.previousVisibleEntities.has(
        entity,
      )
    );
  }

  public get(
    entity: number,
  ): RenderState | undefined {
    return this.states.get(
      entity,
    );
  }

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