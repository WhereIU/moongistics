import {
  Cache,
  Rectangle,
  Texture,
} from 'pixi.js';

import type {
  FrameRect,
} from '@/prototypes/types';

export function getFrameCacheKey(
  textureKey: string,
  frameSetKey: string,
  frameIndex: number,
): string {
  return [
    'frame',
    textureKey,
    frameSetKey,
    frameIndex,
  ].join(':');
}

export function cacheTextureFrames(
  textureKey: string,
  frameSetKey: string,
  baseTexture: Texture,
  frames: FrameRect[],
): void {
  for (
    let index = 0;
    index < frames.length;
    index += 1
  ) {
    const frame =
      frames[index];

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
      getFrameCacheKey(
        textureKey,
        frameSetKey,
        index,
      ),
      texture,
    );
  }
}