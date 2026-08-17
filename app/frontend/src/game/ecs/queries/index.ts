import {
  query,
} from 'bitecs';

import {
  Transform,
  Velocity,
  Renderable,
  VisualAnimation,
} from '../components';

import type {
  EcsWorld,
} from '../world/EcsWorld';

export const queries = {
  moving(
    world: EcsWorld,
  ) {
    return query(
      world,
      [
        Transform,
        Velocity,
      ],
    );
  },

  animated(
    world: EcsWorld,
  ) {
    return query(
      world,
      [
        VisualAnimation,
      ],
    );
  },

  renderable(
    world: EcsWorld,
  ) {
    return query(
      world,
      [
        Transform,
        Renderable,
      ],
    );
  },

  animatedRenderable(
    world: EcsWorld,
  ) {
    return query(
      world,
      [
        Transform,
        Renderable,
        VisualAnimation,
      ],
    );
  },
};