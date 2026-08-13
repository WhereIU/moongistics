import { Container, Sprite, Texture, Assets } from 'pixi.js';
import type { BasePrototype } from './types';

export abstract class BaseEntity<T extends BasePrototype = BasePrototype> {
  public container: Container;
  public sprite: Sprite;
  public prototype: T;

  constructor(proto: T) {
    this.prototype = proto;
    this.container = new Container();

    const texture = Assets.get<Texture>(proto.textureKey) || Texture.EMPTY;

    this.sprite = new Sprite(texture);
    
    this.sprite.anchor.set(0.5);

    this.container.addChild(this.sprite);
  }

  public setPosition(x: number, y: number): void {
    this.container.x = x;
    this.container.y = y;
  }

  public destroy(): void {
    this.container.destroy({ children: true });
  }

  public update(_delta: number): void {}
}