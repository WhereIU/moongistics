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
    new Map<
      string,
      LoadedFrameSet
    >();

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
        [
          `[AssetRegistry] Cannot build frame set "${id}".`,
          `Asset "${sourceKey}" has not been loaded.`,
        ].join(' '),
      );
    }

    const frameRects =
      this.resolveFrameRects(
        id,
        baseTexture,
        definition,
      );

    if (
      frameRects.length === 0
    ) {
      throw new Error(
        `[AssetRegistry] Frame set "${id}" resolved to zero frames.`,
      );
    }

    const textures =
      frameRects.map(
        (frame, index) => {
          const cacheKey =
            `frame:${id}:${index}`;

          if (Cache.has(cacheKey)) {
            return Cache.get<Texture>(
              cacheKey,
            );
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
      frames:
        textures,
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
    id: string,
    texture: Texture,
    definition: FrameSetDefinition,
  ): FrameRect[] {
    if (
      definition.frames
    ) {
      return definition.frames;
    }

    if (
      definition.grid
    ) {
      return this.generateGridFrames(
        id,
        texture.width,
        texture.height,
        definition.grid,
      );
    }

    return [
      {
        x: 0,
        y: 0,
        w:
          texture.width,
        h:
          texture.height,
      },
    ];
  }

  private generateGridFrames(
    id: string,
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
      throw new Error(
        [
          `[AssetRegistry] Invalid grid in frame set "${id}".`,
          `Frame size must be greater than zero.`,
        ].join(' '),
      );
    }

    if (
      startX < 0 ||
      startY < 0
    ) {
      throw new Error(
        [
          `[AssetRegistry] Invalid grid in frame set "${id}".`,
          `startX/startY cannot be negative.`,
        ].join(' '),
      );
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
      throw new Error(
        [
          `[AssetRegistry] Grid in frame set "${id}" does not fit inside the source image.`,
          `Image: ${imageWidth}x${imageHeight}.`,
          `Frame: ${frameWidth}x${frameHeight}.`,
          `Start: ${startX},${startY}.`,
        ].join(' '),
      );
    }

    const availableFrames =
      maxCols *
      maxRows;

    if (
      count !== undefined &&
      count <= 0
    ) {
      throw new Error(
        `[AssetRegistry] Frame count must be greater than zero in frame set "${id}".`,
      );
    }

    if (
      count !== undefined &&
      count > availableFrames
    ) {
      throw new Error(
        [
          `[AssetRegistry] Frame set "${id}" requests ${count} frames,`,
          `but only ${availableFrames} fit inside the source image.`,
        ].join(' '),
      );
    }

    const totalFrames =
      count ??
      availableFrames;

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

        w:
          frameWidth,

        h:
          frameHeight,
      });
    }

    return frames;
  }
}