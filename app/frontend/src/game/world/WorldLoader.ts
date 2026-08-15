import { gameApi } from '@/api/client';
import { GameWorld } from '../GameWorld';

export class WorldLoader {
  public async load(
    worldId: string,
  ): Promise<GameWorld> {
    const data =
      await gameApi.getWorldData(
        worldId,
      );

    const world =
      new GameWorld(data);

    world.initialize();

    return world;
  }
}