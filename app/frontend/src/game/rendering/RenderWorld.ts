import {
  AnimatedSprite,
  Container,
  Sprite,
  type ContainerChild,
  type Texture,
} from 'pixi.js';

import type { RenderObjectFactory } from './RenderObjectFactory';
import type { RenderTypeId } from '@/game/ecs/components/rendering';

export interface RenderEntityState {
  x: number;
  y: number;
  rotation: number;
  visible: boolean;
  layer: number;
  renderable: {
    type: RenderTypeId;
    frames: readonly Texture[];
    frame: number;
    tint: number | null;
  };
}

interface AppliedRenderState {
  x: number;
  y: number;
  rotation: number;
  visible: boolean;
  layer: number;
  type: RenderTypeId;
  frames: readonly Texture[];
  frame: number;
  tint: number | null;
}

export class RenderWorld {
  private readonly container: Container;
  private readonly factory: RenderObjectFactory;
  private readonly objects = new Map<number, ContainerChild>();
  private readonly states = new Map<number, AppliedRenderState>();
  private readonly layerContainers = new Map<number, Container>();

  public constructor(container: Container, factory: RenderObjectFactory) {
    this.container = container;
    this.factory = factory;
    this.container.sortableChildren = true;
  }

  public syncEntity(entity: number, state: RenderEntityState): void {
    let object = this.objects.get(entity);
    const previous = this.states.get(entity);

    const renderableChanged = previous !== undefined &&
      (previous.type !== state.renderable.type || previous.frames !== state.renderable.frames);

    if (object && renderableChanged) {
      this.destroyObject(entity, object);
      object = undefined;
    }

    if (!object) {
      object = this.factory.create(state.renderable);
      this.objects.set(entity, object);
      this.getLayerContainer(state.layer).addChild(object);
    } else if (previous && previous.layer !== state.layer) {
      object.removeFromParent();
      this.getLayerContainer(state.layer).addChild(object);
    }

    this.updateObject(entity, object, state);
  }

  private getLayerContainer(layer: number): Container {
    const existing = this.layerContainers.get(layer);
    if (existing) return existing;

    const layerContainer = new Container();
    layerContainer.zIndex = layer;
    this.layerContainers.set(layer, layerContainer);
    this.container.addChild(layerContainer);
    return layerContainer;
  }

  private updateObject(entity: number, object: ContainerChild, state: RenderEntityState): void {
    const previous = this.states.get(entity);

    if (!previous || previous.x !== state.x || previous.y !== state.y) {
      object.position.set(state.x, state.y);
    }
    if (!previous || previous.rotation !== state.rotation) {
      object.rotation = state.rotation;
    }
    if (!previous || previous.visible !== state.visible) {
      object.visible = state.visible;
    }

    const frame = state.renderable.frame;

    if (object instanceof AnimatedSprite) {
      if (!previous || previous.frame !== frame) {
        if (frame < 0 || frame >= object.totalFrames) {
          throw new Error(`[RenderWorld] Frame index ${frame} is outside the available range for entity ${entity}.`);
        }
        object.gotoAndStop(frame);
      }
    } else if (object instanceof Sprite) {
      if (!previous || previous.frames !== state.renderable.frames || previous.frame !== frame) {
        const texture = state.renderable.frames[frame];
        if (!texture) {
          throw new Error(`[RenderWorld] Frame index ${frame} is outside the available range for entity ${entity}.`);
        }
        object.texture = texture;
      }
    }

    if (!previous || previous.tint !== state.renderable.tint) {
      if (object instanceof Sprite || object instanceof AnimatedSprite) {
        object.tint = state.renderable.tint ?? 0xffffff;
      }
    }

    this.states.set(entity, {
      x: state.x,
      y: state.y,
      rotation: state.rotation,
      visible: state.visible,
      layer: state.layer,
      type: state.renderable.type,
      frames: state.renderable.frames,
      frame,
      tint: state.renderable.tint,
    });
  }

  private destroyObject(entity: number, object: ContainerChild): void {
    object.removeFromParent();
    object.destroy();
    this.objects.delete(entity);
    this.states.delete(entity);
  }

  public removeEntity(entity: number): void {
    const object = this.objects.get(entity);
    if (object) {
      this.destroyObject(entity, object);
    } else {
      this.states.delete(entity);
    }
  }

  public clear(): void {
    for (const [entity, object] of this.objects) {
      this.destroyObject(entity, object);
    }
    for (const layerContainer of this.layerContainers.values()) {
      layerContainer.removeFromParent();
      layerContainer.destroy({ children: true });
    }
    this.layerContainers.clear();
    this.objects.clear();
    this.states.clear();
  }

  public removeMissingEntities(activeEntities: Set<number>): void {
    for (const entity of this.objects.keys()) {
      if (!activeEntities.has(entity)) this.removeEntity(entity);
    }
  }

  public getObjectCount(): number {
    return this.objects.size;
  }
}
