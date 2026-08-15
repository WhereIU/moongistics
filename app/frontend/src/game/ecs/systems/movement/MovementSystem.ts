import { Transform, Velocity } from '../../components';
import { queries } from '../../queries';
import type { EcsSystem } from '../../world/types';
import type { EcsWorldFacade } from '../../world/EcsWorld';

export class MovementSystem implements EcsSystem {
  public readonly name = 'movement';

  public update(
    world: EcsWorldFacade,
    deltaSeconds: number,
  ): void {
    const rawWorld = world.raw;

    for (const entity of queries.moving(rawWorld)) {
      Transform.x[entity] +=
        Velocity.x[entity] * deltaSeconds;

      Transform.y[entity] +=
        Velocity.y[entity] * deltaSeconds;
    }
  }
}