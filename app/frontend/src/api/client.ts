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
 * Позже MockWorldApi здесь будет заменён HTTP-реализацией,
 * которая будет обращаться к Django API. Интерфейс GameApi
 * остаётся клиентской границей между игровым кодом и сервером.
 */
export function createGameApi(): GameApi {
  return new MockWorldApi();
}

export const gameApi: GameApi =
  createGameApi();