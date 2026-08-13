import { Assets, Cache, Texture, Rectangle } from 'pixi.js';
import { PrototypeRegistry } from '@/entities/registry/PrototypeRegistry';
import { generateGridFrames } from '@/shared/utils/spritesheet';
import type { TilePrototype, FrameRect } from '@/entities/base/types';

export async function loadGameAssets(): Promise<void> {
  const allPrototypes = PrototypeRegistry.getAll();
  const loadPromises: Promise<unknown>[] = [];

  for (const proto of allPrototypes) {
    if (proto.textureUrl) {
      Assets.add({
        alias: proto.textureKey,
        src: proto.textureUrl,
      });
      loadPromises.push(Assets.load(proto.textureKey));
    }
  }

  await Promise.all(loadPromises);

  for (const proto of allPrototypes) {
    const tileProto = proto as TilePrototype;
    const baseTexture = Assets.get<Texture>(proto.textureKey);

    if (!baseTexture) continue;

    let framesToCut: FrameRect[] = [];

    if (tileProto.gridConfig) {
      framesToCut = generateGridFrames(baseTexture.width, tileProto.gridConfig);
    } 
    else if (tileProto.frames) {
      framesToCut = tileProto.frames;
    }

    framesToCut.forEach((frame, index) => {
      const subTexture = new Texture({
        source: baseTexture.source,
        frame: new Rectangle(frame.x, frame.y, frame.w, frame.h),
      });

      Cache.set(`${proto.textureKey}_${index}`, subTexture);
    });
  }
}