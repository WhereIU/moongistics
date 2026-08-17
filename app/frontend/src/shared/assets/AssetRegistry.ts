import {
  Assets,
  Cache,
  Rectangle,
  Texture,
} from 'pixi.js';

import type {
  FrameRect,
  FrameSetDefinition,
} from '@/prototypes/types';

export interface LoadedFrameSet {
  readonly id: string;
  readonly frames: readonly Texture[];
}

export class AssetRegistry {
  private readonly frameSets =
    new Map<string, LoadedFrameSet>();

  public registerFrameSet(
    id: string,
    definition: FrameSetDefinition,
  ): LoadedFrameSet {
    const existing =
      this.frameSets.get(id);

    if (existing) {
      return existing;
    }

    const sourceKey =
      definition.source.key ??
      definition.source.url;

    const baseTexture =
      Assets.get<Texture>(
        sourceKey,
      );

    if (!baseTexture) {
      throw new Error(
        `[AssetRegistry] Asset not loaded: ${sourceKey}`,
      );
    }

    const frameRects =
      this.resolveFrameRects(
        baseTexture,
        definition,
      );

    const textures =
      frameRects.map(
        (frame, index) => {
          const cacheKey =
            `frame:${id}:${index}`;

          const cached =
            Cache.get<Texture>(
              cacheKey,
            );

          if (cached) {
            return cached;
          }

          const texture =
            new Texture({
              source:
                baseTexture.source,

              frame:
                new Rectangle(
                  frame.x,
                  frame.y,
                  frame.w,
                  frame.h,
                ),
            });

          Cache.set(
            cacheKey,
            texture,
          );

          return texture;
        },
      );

    const frameSet: LoadedFrameSet = {
      id,
      frames: textures,
    };

    this.frameSets.set(
      id,
      frameSet,
    );

    return frameSet;
  }

  public getFrameSet(
    id: string,
  ): LoadedFrameSet | undefined {
    return this.frameSets.get(
      id,
    );
  }

  public getFrame(
    id: string,
    frame: number,
  ): Texture | undefined {
    return this.frameSets
      .get(id)
      ?.frames[frame];
  }

  public clear(): void {
    this.frameSets.clear();
  }

  private resolveFrameRects(
    texture: Texture,
    definition: FrameSetDefinition,
  ): FrameRect[] {
    if (definition.frames) {
      return definition.frames;
    }

    if (definition.grid) {
      return this.generateGridFrames(
        texture.width,
        texture.height,
        definition.grid,
      );
    }

    return [
      {
        x: 0,
        y: 0,
        w: texture.width,
        h: texture.height,
      },
    ];
  }

  private generateGridFrames(
    imageWidth: number,
    imageHeight: number,
    config: NonNullable<
      FrameSetDefinition['grid']
    >,
  ): FrameRect[] {
    const {
      frameWidth,
      frameHeight,
      startX = 0,
      startY = 0,
      count,
    } = config;

    if (
      frameWidth <= 0 ||
      frameHeight <= 0
    ) {
      return [];
    }

    const maxCols =
      Math.floor(
        (
          imageWidth -
          startX
        ) /
        frameWidth,
      );

    const maxRows =
      Math.floor(
        (
          imageHeight -
          startY
        ) /
        frameHeight,
      );

    if (
      maxCols <= 0 ||
      maxRows <= 0
    ) {
      return [];
    }

    const availableFrames =
      maxCols *
      maxRows;

    const totalFrames =
      count === undefined
        ? availableFrames
        : Math.min(
            count,
            availableFrames,
          );

    const frames: FrameRect[] = [];

    for (
      let index = 0;
      index < totalFrames;
      index += 1
    ) {
      const column =
        index %
        maxCols;

      const row =
        Math.floor(
          index /
          maxCols,
        );

      frames.push({
        x:
          startX +
          column *
          frameWidth,

        y:
          startY +
          row *
          frameHeight,

        w: frameWidth,
        h: frameHeight,
      });
    }

    return frames;
  }
}