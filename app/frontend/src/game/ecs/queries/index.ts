import { query } from 'bitecs';
import { Animation, Renderable, Transform, Velocity } from '../components';
import type { EcsWorld } from '../world/EcsWorld';

export const queries = {
  moving(world: EcsWorld) {
    return query(world, [Transform, Velocity]);
  },
  animated(world: EcsWorld) {
    return query(world, [Animation]);
  },
  renderable(world: EcsWorld) {
    return query(world, [Transform, Renderable]);
  },
  animatedRenderable(world: EcsWorld) {
    return query(world, [Transform, Renderable, Animation]);
  },
};
