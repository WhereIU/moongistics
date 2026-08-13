import { BaseEntity } from '../base/BaseEntity';
import { PrototypeRegistry } from './PrototypeRegistry';
import { TileEntity } from '../tiles/TileEntity';

type EntityConstructor = new (proto: any) => BaseEntity;

const ENTITY_MAP: Record<string, EntityConstructor> = {
  'tile': TileEntity,
};

export class EntityFactory {
  public static create<T extends BaseEntity = BaseEntity>(type: string, id: string): T {
    const proto = PrototypeRegistry.get(type, id);
    const EntityClass = ENTITY_MAP[proto.type];

    if (!EntityClass) {
      throw new Error(`[EntityFactory] No class registered for type: ${proto.type}`);
    }

    return new EntityClass(proto) as T;
  }
}