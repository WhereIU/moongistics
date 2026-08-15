import type { WorldData } from './types';
import { MockWorldApi } from './mock/mockWorldApi';

export interface GameApi {
  getWorldData(
    worldId: string,
  ): Promise<WorldData>;
}

/*
 * Временная реализация для разработки.
 *
 * Позже MockWorldApi здесь будет заменён
 * на HttpGameApi.
 */
export const gameApi: GameApi =
  new MockWorldApi();