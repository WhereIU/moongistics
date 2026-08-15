import { GameApp } from './GameApp';

const container =
  document.getElementById('app');

if (!container) {
  throw new Error(
    'Application container not found',
  );
}

const game =
  new GameApp();

await game.init(
  container,
);