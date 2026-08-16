import {
  AnimatedSprite,
  Assets,
  Cache,
  Container,
  Sprite,
  Texture,
} from 'pixi.js';

import {
  RenderType,
  type RenderTypeId,
} from '@/game/ecs/components/rendering';

export interface RenderObjectData {
  type: RenderTypeId;
  assetKey: string;

  // Normalized ECS value.
  visualVariant: number;
}

export class RenderObjectFactory {
  public create(
    data: RenderObjectData,
  ): Container | Sprite | AnimatedSprite {
    switch (data.type) {
      case RenderType.Sprite:
        return this.createSprite(data);

      case RenderType.Animated:
        return this.createAnimatedSprite(data);

      case RenderType.Container:
        return new Container();

      default:
        throw new Error(
          `[RenderObjectFactory] Unknown render type: ${data.type}`,
        );
    }
  }

  private createSprite(
    data: RenderObjectData,
  ): Sprite {
    const texture =
      this.resolveTexture(
        data.assetKey,
        data.visualVariant,
      );

    const sprite =
      new Sprite(texture);

    sprite.anchor.set(0.5);

    return sprite;
  }

  private createAnimatedSprite(
    data: RenderObjectData,
  ): AnimatedSprite {
    const texture =
      this.resolveTexture(
        data.assetKey,
        data.visualVariant,
      );

    const sprite =
      new AnimatedSprite([
        texture,
      ]);

    sprite.anchor.set(0.5);

    return sprite;
  }

  private resolveTexture(
    assetKey: string,
    visualVariant: number,
  ): Texture {
    const variantKey =
      `${assetKey}_${visualVariant}`;

    const cachedTexture =
      Cache.get<Texture>(
        variantKey,
      );

    if (cachedTexture) {
      return cachedTexture;
    }

    // No variant texture exists.
    // Use the base asset as the fallback.
    const baseTexture =
      Assets.get<Texture>(
        assetKey,
      );

    if (!baseTexture) {
      throw new Error(
        `[RenderObjectFactory] Texture not found: ${assetKey}`,
      );
    }

    return baseTexture;
  }
}