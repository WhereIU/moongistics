import {
  AnimatedSprite,
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
  variant?: number;
}

export class RenderObjectFactory {
  public create(data: RenderObjectData): Container | Sprite | AnimatedSprite {
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

  private createSprite(data: RenderObjectData): Sprite {
    const texture = this.resolveTexture(
      data.assetKey,
      data.variant,
    );

    const sprite = new Sprite(texture);

    sprite.anchor.set(0.5);

    return sprite;
  }

  private createAnimatedSprite(
    data: RenderObjectData,
  ): AnimatedSprite {
    const variant = data.variant ?? 0;

    const texture = this.resolveTexture(
      data.assetKey,
      variant,
    );

    const sprite = new AnimatedSprite([texture]);

    sprite.anchor.set(0.5);

    return sprite;
  }

  private resolveTexture(
    assetKey: string,
    variant?: number,
  ): Texture {
    if (variant !== undefined) {
      const variantKey = `${assetKey}_${variant}`;
      const variantTexture = Texture.from(variantKey);

      if (variantTexture !== Texture.EMPTY) {
        return variantTexture;
      }
    }

    return Texture.from(assetKey);
  }
}