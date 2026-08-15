import type { EcsWorldFacade } from './EcsWorld';

export interface EcsSystem {
  readonly name: string;

  update(
    world: EcsWorldFacade,
    deltaSeconds: number,
  ): void;
}