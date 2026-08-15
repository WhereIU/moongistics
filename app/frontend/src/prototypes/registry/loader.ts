import type { BasePrototype } from '../base/types';
import { PrototypeRegistry } from './PrototypeRegistry';

export async function loadAllPrototypes(): Promise<void> {
  const modules = import.meta.glob<{ prototype: BasePrototype }>(
    '../**/*/prototype.ts',
    { eager: true },
  );

  PrototypeRegistry.extend(
    Object.values(modules)
      .map((module) => module.prototype)
      .filter((prototype): prototype is BasePrototype => Boolean(prototype)),
  );
}
