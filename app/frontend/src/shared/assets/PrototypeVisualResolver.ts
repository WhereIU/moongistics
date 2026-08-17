import type {
  Texture,
} from 'pixi.js';

import {
  PrototypeRegistry,
} from '@/prototypes/registry/PrototypeRegistry';

import type {
  BasePrototype,
  AnimationDefinition,
  PrototypeRenderConfig,
} from '@/prototypes/types';

import {
  assetRegistry,
  getFrameSetId,
} from './AssetLoader';

import type {
  LoadedFrameSet,
} from './AssetRegistry';

import {
  RenderType,
  type RenderTypeId,
} from '@/game/ecs/components/rendering';

export interface ResolvedAnimation {
  readonly id: string;

  readonly frames: readonly Texture[];

  readonly fps: number;
  readonly loop: boolean;
}

export interface ResolvedVisual {
  readonly type: RenderTypeId;

  readonly staticFrames: readonly Texture[] | null;

  readonly animations:
    ReadonlyMap<string, ResolvedAnimation>;

  readonly tint: number | null;
}

export class PrototypeVisualResolver {
  private readonly cache =
    new Map<string, ResolvedVisual>();

  public resolve(
    type: BasePrototype['type'],
    id: string,
  ): ResolvedVisual {
    const cacheKey =
      `${type}.${id}`;

    const cached =
      this.cache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const prototype =
      PrototypeRegistry.get(
        type,
        id,
      );

    const resolved =
      this.resolvePrototype(
        prototype,
      );

    this.cache.set(
      cacheKey,
      resolved,
    );

    return resolved;
  }

  public clear(): void {
    this.cache.clear();
  }

  private resolvePrototype(
    prototype: BasePrototype,
  ): ResolvedVisual {
    const render =
      prototype.render;

    if (!render) {
      return {
        type:
          RenderType.Container,

        staticFrames:
          null,

        animations:
          new Map(),

        tint:
          null,
      };
    }

    const type =
      this.resolveRenderType(
        render,
      );

    const staticFrames =
      render.static
        ? this.getFrameSet(
            getFrameSetId(
              prototype,
              'static',
            ),
          ).frames
        : null;

    const animations =
      new Map<
        string,
        ResolvedAnimation
      >();

    if (render.animations) {
      for (
        const [
          animationId,
          definition,
        ]
        of Object.entries(
          render.animations,
        )
      ) {
        animations.set(
          animationId,
          this.resolveAnimation(
            prototype,
            animationId,
            definition,
          ),
        );
      }
    }

    return {
      type,

      staticFrames,

      animations,

      tint:
        render.tint ??
        null,
    };
  }

  private resolveAnimation(
    prototype: BasePrototype,
    animationId: string,
    definition: AnimationDefinition,
  ): ResolvedAnimation {
    const frameSet =
      this.getFrameSet(
        getFrameSetId(
          prototype,
          `animation.${animationId}`,
        ),
      );

    return {
      id:
        animationId,

      frames:
        frameSet.frames,

      fps:
        definition.fps,

      loop:
        definition.loop !== false,
    };
  }

  private getFrameSet(
    id: string,
  ): LoadedFrameSet {
    const frameSet =
      assetRegistry.getFrameSet(id);

    if (!frameSet) {
      throw new Error(
        `[PrototypeVisualResolver] Frame set not found: ${id}`,
      );
    }

    if (
      frameSet.frames.length === 0
    ) {
      throw new Error(
        `[PrototypeVisualResolver] Frame set contains no frames: ${id}`,
      );
    }

    return frameSet;
  }

  private resolveRenderType(
    render: PrototypeRenderConfig,
  ): RenderTypeId {
    switch (
      render.type
    ) {
      case 'sprite':
        return RenderType.Sprite;

      case 'animated':
        return RenderType.Animated;

      case 'container':
        return RenderType.Container;

      case undefined:
        if (
          render.animations &&
          Object.keys(
            render.animations,
          ).length > 0
        ) {
          return RenderType.Animated;
        }

        return RenderType.Sprite;

      default:
        throw new Error(
          `[PrototypeVisualResolver] Unknown render type: ${String(render.type)}`,
        );
    }
  }
}

export const prototypeVisualResolver =
  new PrototypeVisualResolver();