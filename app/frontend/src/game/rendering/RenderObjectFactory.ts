import {
  AnimatedSprite,
  Container,
  Sprite,
  type Texture,
} from 'pixi.js';

import {
  RenderType,
  type RenderTypeId,
} from '@/game/ecs/components/rendering';

export interface RenderObjectData {
  type: RenderTypeId;

  frames:
    readonly Texture[];

  frame:
    number;

  tint:
    number | null;
}

export class RenderObjectFactory {
  public create(
    data: RenderObjectData,
  ): Container | Sprite | AnimatedSprite {
    switch (
      data.type
    ) {
      case RenderType.Sprite:
        return this.createSprite(
          data,
        );

      case RenderType.Animated:
        return this.createAnimatedSprite(
          data,
        );

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
      this.getFrame(
        data.frames,
        data.frame,
      );

    const sprite =
      new Sprite(
        texture,
      );

    sprite.anchor.set(
      0.5,
    );

    if (
      data.tint !== null
    ) {
      sprite.tint =
        data.tint;
    }

    return sprite;
  }

  private createAnimatedSprite(
    data: RenderObjectData,
  ): AnimatedSprite {
    if (
      data.frames.length === 0
    ) {
      throw new Error(
        `[RenderObjectFactory] Cannot create AnimatedSprite without frames.`,
      );
    }

    const sprite =
      new AnimatedSprite([
        ...data.frames,
      ]);

    sprite.anchor.set(
      0.5,
    );

    const frame =
      Math.min(
        Math.max(
          data.frame,
          0,
        ),
        data.frames.length - 1,
      );

    sprite.gotoAndStop(
      frame,
    );

    if (
      data.tint !== null
    ) {
      sprite.tint =
        data.tint;
    }

    return sprite;
  }

  private getFrame(
    frames: readonly Texture[],
    frame: number,
  ): Texture {
    if (
      frames.length === 0
    ) {
      throw new Error(
        `[RenderObjectFactory] Cannot create Sprite without frames.`,
      );
    }

    if (
      frame < 0 ||
      frame >= frames.length
    ) {
      throw new Error(
        [
          `[RenderObjectFactory] Frame index ${frame} is outside`,
          `the available range 0..${frames.length - 1}.`,
        ].join(' '),
      );
    }

    return frames[frame];
  }
}