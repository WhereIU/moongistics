import type { BasePrototype } from '../base/types';

class PrototypeRegistryManager {
  private readonly raw = new Map<string, Map<string, BasePrototype>>();

  public extend(prototypes: BasePrototype[]): void {
    for (const proto of prototypes) {
      let category = this.raw.get(proto.type);
      if (!category) {
        category = new Map<string, BasePrototype>();
        this.raw.set(proto.type, category);
      }
      category.set(proto.id, proto);
    }
  }

  public get<T extends BasePrototype>(type: string, id: string): T {
    const prototype = this.raw.get(type)?.get(id);
    if (!prototype) {
      throw new Error(`[PrototypeRegistry] Prototype not found: ${type}.${id}`);
    }
    return prototype as T;
  }

  public getAll(): BasePrototype[] {
    return [...this.raw.values()].flatMap((category) => [...category.values()]);
  }
}

export const PrototypeRegistry = new PrototypeRegistryManager();
