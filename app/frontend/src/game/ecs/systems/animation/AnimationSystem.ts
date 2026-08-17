import {
  VisualAnimation,
} from '../../components';

import {
  queries,
} from '../../queries';

import type {
  EcsSystem,
} from '../../world/types';

import type {
  EcsWorldFacade,
} from '../../world/EcsWorld';

import {
  PrototypeRef,
} from '../../components/core';

import {
  prototypeVisualResolver,
} from '@/shared/assets/PrototypeVisualResolver';

export class AnimationSystem
  implements EcsSystem
{
  public readonly name =
    'animation';

  public update(
    world: EcsWorldFacade,
    deltaSeconds: number,
  ): void {
    const rawWorld =
      world.raw;

    for (
      const entity
      of queries.animated(
        rawWorld,
      )
    ) {
      if (
        VisualAnimation.playing[entity] !==
        1
      ) {
        continue;
      }

      const prototypeType =
        PrototypeRef.type[entity];

      const prototypeId =
        PrototypeRef.id[entity];

      const animationId =
        VisualAnimation.id[entity];

      const visual =
        prototypeVisualResolver.resolve(
          prototypeType as 'tile' | 'structure',
          prototypeId,
        );

      const animation =
        visual.animations.get(
          animationId,
        );

      if (!animation) {
        throw new Error(
          [
            `[AnimationSystem] Animation "${animationId}" not found`,
            `for prototype ${prototypeType}.${prototypeId}.`,
          ].join(' '),
        );
      }

      const frameCount =
        animation.frames.length;

      if (
        frameCount <= 0 ||
        animation.fps <= 0
      ) {
        continue;
      }

      VisualAnimation.elapsedSeconds[entity] +=
        deltaSeconds;

      const frameDuration =
        1 /
        animation.fps;

      let frameChanged =
        false;

      while (
        VisualAnimation.elapsedSeconds[entity] >=
        frameDuration
      ) {
        VisualAnimation.elapsedSeconds[entity] -=
          frameDuration;

        VisualAnimation.frame[entity] +=
          1;

        frameChanged =
          true;

        if (
          VisualAnimation.frame[entity] >=
          frameCount
        ) {
          if (
            animation.loop
          ) {
            VisualAnimation.frame[entity] =
              0;
          } else {
            VisualAnimation.frame[entity] =
              frameCount - 1;

            VisualAnimation.playing[entity] =
              0;

            break;
          }
        }
      }

      if (
        frameChanged
      ) {
        world.markRenderDirty(
          entity,
        );
      }
    }
  }
}