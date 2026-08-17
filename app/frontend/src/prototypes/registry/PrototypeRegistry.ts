import type {
  BasePrototype,
} from '../types';

class PrototypeRegistryManager {
  private readonly raw =
    new Map<
      string,
      Map<string, BasePrototype>
    >();

  public extend(
    prototypes: BasePrototype[],
  ): void {
    for (
      const prototype
      of prototypes
    ) {
      let category =
        this.raw.get(
          prototype.type,
        );

      if (!category) {
        category =
          new Map<
            string,
            BasePrototype
          >();

        this.raw.set(
          prototype.type,
          category,
        );
      }

      category.set(
        prototype.id,
        prototype,
      );
    }
  }

  public get<
    T extends BasePrototype,
  >(
    type: string,
    id: string,
  ): T {
    const prototype =
      this.raw
        .get(type)
        ?.get(id);

    if (!prototype) {
      throw new Error(
        `[PrototypeRegistry] Prototype not found: ${type}.${id}`,
      );
    }

    return prototype as T;
  }

  public getAll(): BasePrototype[] {
    return [
      ...this.raw.values(),
    ].flatMap(
      (category) => [
        ...category.values(),
      ],
    );
  }

  public has(
    type: string,
    id: string,
  ): boolean {
    return Boolean(
      this.raw
        .get(type)
        ?.has(id),
    );
  }

  public clear(): void {
    this.raw.clear();
  }
}

export const PrototypeRegistry =
  new PrototypeRegistryManager();