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
} from '@/prototypes/types';

export const assetRegistry =
  new AssetRegistry();

interface RegisteredFrameSet {
  id: string;
  definition: FrameSetDefinition;
}

interface RegisteredAsset {
  source: AssetSource;
}

export function getFrameSetId(
  prototype: BasePrototype,
  suffix: string,
): string {
  return [
    prototype.type,
    prototype.id,
    suffix,
  ].join('.');
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
        getFrameSetId(
          prototype,
          'static',
        ),

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
          getFrameSetId(
            prototype,
            `animation.${animationId}`,
          ),

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
    new Map<
      string,
      RegisteredAsset
    >();

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
      alias:
        key,

      src:
        asset.source.url,
    });
  }

  await Promise.all(
    assets.map(
      async (asset) => {
        const key =
          asset.source.key ??
          asset.source.url;

        try {
          await Assets.load(
            key,
          );
        } catch (error) {
          throw new Error(
            `[AssetLoader] Failed to load asset "${key}" from "${asset.source.url}".`,
            {
              cause:
                error,
            },
          );
        }
      },
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

    if (!texture) {
      throw new Error(
        `[AssetLoader] Asset loaded but texture is unavailable: ${key}`,
      );
    }

    texture.source.scaleMode =
      'nearest';
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