import { GameApp } from '@/app/game';

const appElement = document.getElementById('app') || document.body;
const game = new GameApp();

game.init(appElement).catch(console.error);