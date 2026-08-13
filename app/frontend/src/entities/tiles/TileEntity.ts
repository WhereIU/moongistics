import { BaseEntity } from '../base/BaseEntity';
import type { TilePrototype } from '../base/types';

export class TileEntity extends BaseEntity<TilePrototype> {
  constructor(proto: TilePrototype) {
    super(proto);

    if (proto.tint) {
      this.sprite.tint = proto.tint;
    }
  }
}