import { AnimationSystem } from './ecs/systems/animation/AnimationSystem';
import { MovementSystem } from './ecs/systems/movement/MovementSystem';

import type { EcsWorldFacade } from './ecs/world/EcsWorld';
import type { EcsSystem } from './ecs/world/types';

export class Simulation {
  private readonly world: EcsWorldFacade;

  private readonly systems: EcsSystem[] = [
    new MovementSystem(),
    new AnimationSystem(),
  ];

  public constructor(world: EcsWorldFacade) {
    this.world = world;
  }

  public update(deltaSeconds: number): void {
    const clock = this.world.raw.clock;

    clock.tick += 1;
    clock.simulationTimeSeconds += deltaSeconds;

    for (const system of this.systems) {
      system.update(
        this.world,
        deltaSeconds,
      );
    }
  }
}