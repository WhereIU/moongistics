import {
  Application,
  Container,
  Ticker,
} from 'pixi.js';

import {
  loadAllPrototypes,
} from '@/prototypes/registry/loader';

import {
  loadGameAssets,
} from '../shared/assets/AssetLoader';

import {
  MainMenu,
} from '@/ui/MainMenu';

import {
  CameraControl,
} from '@/features/camera-control/CameraControl';

import {
  GameLoop,
} from '@/game/GameLoop';

import {
  GameWorld,
} from '@/game/GameWorld';

import {
  Simulation,
} from '@/game/Simulation';

import {
  WorldLoader,
} from '@/game/world/WorldLoader';

import {
  RenderObjectFactory,
} from '@/game/rendering/RenderObjectFactory';

import {
  RenderWorld,
} from '@/game/rendering/RenderWorld';

import {
  RenderSystem,
} from '@/game/ecs/systems/rendering/RenderSystem';

export class GameApp {
  public readonly app: Application;
  public readonly mapContainer: Container;

  private readonly entityLayer: Container;

  private readonly worldLoader: WorldLoader;

  private renderWorld!: RenderWorld;
  private renderSystem!: RenderSystem;

  private cameraControl!: CameraControl;
  private mainMenu!: MainMenu;

  private gameWorld: GameWorld | null = null;
  private gameLoop!: GameLoop;

  public constructor() {
    this.app =
      new Application();

    this.mapContainer =
      new Container();

    this.entityLayer =
      new Container();

    this.mapContainer.addChild(
      this.entityLayer,
    );

    this.worldLoader =
      new WorldLoader();
  }

  public async init(
    container: HTMLElement,
  ): Promise<void> {
    await this.app.init({
      resizeTo: window,

      backgroundColor:
        0x0a0a0c,

      resolution:
        window.devicePixelRatio || 1,

      autoDensity: true,
    });

    container.appendChild(
      this.app.canvas,
    );

    this.centerWorldContainer();

    window.addEventListener(
      'resize',
      this.centerWorldContainer,
    );

    await loadAllPrototypes();
    await loadGameAssets();

    this.app.stage.addChild(
      this.mapContainer,
    );

    this.cameraControl =
      new CameraControl(
        this.mapContainer,
        {
          minScale: 0.6,
          maxScale: 1.8,
          boundsRadius: 1200,
        },
      );

    this.cameraControl.attach(
      this.app,
      this.app.canvas as HTMLCanvasElement,
    );

    this.gameWorld =
      await this.worldLoader.load(
        'mock-world',
      );

    this.renderWorld =
      new RenderWorld(
        this.entityLayer,
        new RenderObjectFactory(),
      );

    this.renderSystem =
      new RenderSystem(
        this.renderWorld,
        this.gameWorld.data.tileSize,
        1,
      );

    const simulation =
      new Simulation(
        this.gameWorld.ecs,
      );

    this.gameLoop =
      new GameLoop(
        simulation,
        {
          updatesPerSecond: 20,
          maxTicksPerFrame: 5,
        },
      );

    this.mainMenu =
      new MainMenu(
        () => this.startGame(),
      );

    this.mainMenu.mount(
      container,
    );

    this.mainMenu.setUserInfo(
      'Командующий',
    );

    this.app.ticker.add(
      this.onFrame,
      this,
    );
  }

  private readonly centerWorldContainer =
    (): void => {
      this.mapContainer.position.set(
        window.innerWidth / 2,
        window.innerHeight / 2,
      );
    };

  private startGame(): void {
    if (!this.gameWorld) {
      return;
    }

    this.mainMenu.hide();

    this.renderSystem.sync(
      this.gameWorld.ecs,
      0,
      this.cameraControl.getViewportBounds(
        window.innerWidth,
        window.innerHeight,
      ),
    );
  }

  private onFrame(
    ticker: Ticker,
  ): void {
    if (!this.gameWorld) {
      return;
    }

    const alpha =
      this.gameLoop.update(
        ticker,
      );

    const viewport =
      this.cameraControl.getViewportBounds(
        window.innerWidth,
        window.innerHeight,
      );

    this.renderSystem.sync(
      this.gameWorld.ecs,
      alpha,
      viewport,
    );
  }
}