import type {
  EcsWorldFacade,
} from '../../world/EcsWorld';

import { RenderWorld } from '@/game/rendering/RenderWorld';

export class RenderSystem {
  private readonly renderWorld: RenderWorld;

  public constructor(
    renderWorld: RenderWorld,
  ) {
    this.renderWorld = renderWorld;
  }

  public sync(
    world: EcsWorldFacade,
  ): void {
    const entities =
      world.queryRenderable();

    for (
      const entity of entities
    ) {
      const position =
        world.getPosition(entity);

      const renderable =
        world.getRenderable(entity);

      if (
        !position ||
        !renderable
      ) {
        continue;
      }

      this.renderWorld.syncEntity(
        entity,
        {
          x: position.x,
          y: position.y,
          rotation: position.rotation,

          visible:
            renderable.visible,

          layer:
            renderable.layer,

          renderable: {
            type:
              renderable.type,

            assetKey:
              renderable.assetKey,

            visualVariant:
              renderable.visualVariant,
          },
        },
      );
    }
  }
}