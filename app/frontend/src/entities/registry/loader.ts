import { PrototypeRegistry } from './PrototypeRegistry';
import type { BasePrototype } from '../base/types';

export async function loadAllPrototypes(): Promise<void> {
  const modules = import.meta.glob<{ prototype: BasePrototype }>('../**/*/prototype.ts', { eager: true });
  const prototypes: BasePrototype[] = [];

  for (const path in modules) {
    if (modules[path].prototype) {
      prototypes.push(modules[path].prototype);
    }
  }

  PrototypeRegistry.extend(prototypes);
}