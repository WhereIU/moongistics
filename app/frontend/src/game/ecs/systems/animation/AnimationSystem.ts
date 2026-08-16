import {
  Animation,
} from '../../components';

import { queries } from '../../queries';

import type {
  EcsSystem,
} from '../../world/types';

import type {
  EcsWorldFacade,
} from '../../world/EcsWorld';

export class AnimationSystem implements EcsSystem {
  public readonly name = 'animation';

  public update(
    world: EcsWorldFacade,
    deltaSeconds: number,
  ): void {
    const rawWorld = world.raw;

    for (
      const entity of queries.animated(rawWorld)
    ) {
      if (
        Animation.playing[entity] !== 1
      ) {
        continue;
      }

      if (
        Animation.frameCount[entity] <= 0 ||
        Animation.fps[entity] <= 0
      ) {
        continue;
      }

      Animation.elapsedSeconds[entity] +=
        deltaSeconds;

      const frameDuration =
        1 / Animation.fps[entity];

      let frameChanged = false;

      while (
        Animation.elapsedSeconds[entity] >=
        frameDuration
      ) {
        Animation.elapsedSeconds[entity] -=
          frameDuration;

        Animation.frame[entity] += 1;
        frameChanged = true;

        if (
          Animation.frame[entity] >=
          Animation.frameCount[entity]
        ) {
          if (
            Animation.loop[entity] === 1
          ) {
            Animation.frame[entity] = 0;
          } else {
            Animation.frame[entity] =
              Animation.frameCount[entity] - 1;

            Animation.playing[entity] = 0;
            break;
          }
        }
      }

      if (frameChanged) {
        world.markRenderDirty(entity);
      }
    }
  }
}