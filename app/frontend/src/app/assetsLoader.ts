import { Assets, Cache, Rectangle, Texture } from 'pixi.js';
import { PrototypeRegistry } from '@/prototypes/registry/PrototypeRegistry';
import { generateGridFrames } from '@/shared/utils/spritesheet';
import type { FrameRect, TilePrototype } from '@/prototypes/base/types';
import { isTilePrototype } from '@/prototypes/base/types';

function cacheTileFrames(proto: TilePrototype, baseTexture: Texture): void {
  let frames: FrameRect[] = [];

  if (proto.gridConfig) {
    frames = generateGridFrames(baseTexture.width, baseTexture.height, proto.gridConfig);
  } else if (proto.frames) {
    frames = proto.frames;
  }

  frames.forEach((frame, index) => {
    const texture = new Texture({
      source: baseTexture.source,
      frame: new Rectangle(frame.x, frame.y, frame.w, frame.h),
    });

    Cache.set(`${proto.textureKey}_${index}`, texture);
  });
}

export async function loadGameAssets(): Promise<void> {
  const prototypes = PrototypeRegistry.getAll();
  const aliases = new Set<string>();

  for (const proto of prototypes) {
    if (!proto.textureUrl || aliases.has(proto.textureKey)) continue;

    Assets.add({
      alias: proto.textureKey,
      src: proto.textureUrl,
    });
    aliases.add(proto.textureKey);
  }

  await Promise.all(
    [...aliases].map((textureKey) => Assets.load(textureKey)),
  );

  for (const proto of prototypes) {
    if (!isTilePrototype(proto)) continue;

    const baseTexture = Assets.get<Texture>(proto.textureKey);
    if (!baseTexture) continue;

    if (proto.gridConfig || proto.frames) {
      cacheTileFrames(proto, baseTexture);
    }

    baseTexture.source.scaleMode = 'nearest';
  }
}
