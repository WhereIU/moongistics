import {
  Assets,
  Texture,
} from 'pixi.js';

import {
  PrototypeRegistry,
} from '@/prototypes/registry/PrototypeRegistry';

import {
  AssetRegistry,
} from '@/shared/assets/AssetRegistry';

import type {
  AnimationDefinition,
  AssetSource,
  BasePrototype,
  FrameSetDefinition,
} from '@/prototypes/base/types';

export const assetRegistry =
  new AssetRegistry();

interface RegisteredFrameSet {
  id: string;
  definition: FrameSetDefinition;
}

interface RegisteredAsset {
  source: AssetSource;
}

function collectFrameSets(
  prototype: BasePrototype,
): RegisteredFrameSet[] {
  const result: RegisteredFrameSet[] = [];

  const render =
    prototype.render;

  if (!render) {
    return result;
  }

  if (render.static) {
    result.push({
      id:
        `${prototype.type}.${prototype.id}.static`,

      definition:
        render.static,
    });
  }

  if (render.animations) {
    for (
      const [
        animationId,
        animation,
      ]
      of Object.entries(
        render.animations,
      )
    ) {
      result.push({
        id:
          `${prototype.type}.${prototype.id}.animation.${animationId}`,

        definition:
          animation.frames,
      });
    }
  }

  return result;
}

function collectAssets(
  prototypes: BasePrototype[],
): RegisteredAsset[] {
  const assets =
    new Map<string, RegisteredAsset>();

  for (
    const prototype
    of prototypes
  ) {
    const frameSets =
      collectFrameSets(
        prototype,
      );

    for (
      const frameSet
      of frameSets
    ) {
      const source =
        frameSet.definition.source;

      const key =
        source.key ??
        source.url;

      if (
        assets.has(key)
      ) {
        continue;
      }

      assets.set(
        key,
        {
          source,
        },
      );
    }
  }

  return [
    ...assets.values(),
  ];
}

async function loadAssets(
  assets: RegisteredAsset[],
): Promise<void> {
  for (
    const asset
    of assets
  ) {
    const key =
      asset.source.key ??
      asset.source.url;

    Assets.add({
      alias: key,
      src: asset.source.url,
    });
  }

  await Promise.all(
    assets.map(
      (asset) =>
        Assets.load(
          asset.source.key ??
          asset.source.url,
        ),
    ),
  );

  for (
    const asset
    of assets
  ) {
    const key =
      asset.source.key ??
      asset.source.url;

    const texture =
      Assets.get<Texture>(
        key,
      );

    if (texture) {
      texture.source.scaleMode =
        'nearest';
    }
  }
}

function buildFrameSets(
  prototypes: BasePrototype[],
): void {
  for (
    const prototype
    of prototypes
  ) {
    const frameSets =
      collectFrameSets(
        prototype,
      );

    for (
      const frameSet
      of frameSets
    ) {
      assetRegistry.registerFrameSet(
        frameSet.id,
        frameSet.definition,
      );
    }
  }
}

export async function loadGameAssets(): Promise<void> {
  const prototypes =
    PrototypeRegistry.getAll();

  const assets =
    collectAssets(
      prototypes,
    );

  await loadAssets(
    assets,
  );

  buildFrameSets(
    prototypes,
  );
}