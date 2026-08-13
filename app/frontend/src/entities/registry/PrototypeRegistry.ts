import type { BasePrototype } from '../base/types';

class PrototypeRegistryManager {
  private raw: Map<string, Map<string, BasePrototype>> = new Map();

  public extend(prototypes: BasePrototype[]): void {
    for (const proto of prototypes) {
      if (!this.raw.has(proto.type)) {
        this.raw.set(proto.type, new Map());
      }
      this.raw.get(proto.type)!.set(proto.id, proto);
    }
  }

  public get<T extends BasePrototype>(type: string, id: string): T {
    const category = this.raw.get(type);
    if (!category || !category.has(id)) {
      throw new Error(`[PrototypeRegistry] Prototype not found: ${type}.${id}`);
    }
    return category.get(id) as T;
  }

  public getAll(): BasePrototype[] {
    const result: BasePrototype[] = [];
    for (const category of this.raw.values()) {
      for (const proto of category.values()) {
        result.push(proto);
      }
    }
    return result;
  }
}

export const PrototypeRegistry = new PrototypeRegistryManager();