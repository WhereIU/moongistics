import { Application, Container } from 'pixi.js';
import { loadAllPrototypes } from '@/entities/registry/loader';
import { loadGameAssets } from './assetsLoader';
import { MockApiService, type GameWorldData } from '@/shared/api/mockApi';
import { MainMenu } from '@/ui/MainMenu';
import { MapRenderer } from '@/entities/map/ui/MapRenderer';
import { CameraControl } from '@/features/camera-control/CameraControl';

export class GameApp {
  public app: Application;
  public mapContainer: Container;

  private mapRenderer!: MapRenderer;
  private cameraControl!: CameraControl;
  private mainMenu!: MainMenu;
  private currentWorld: GameWorldData | null = null;

  constructor() {
    this.app = new Application();
    this.mapContainer = new Container();
  }

  public async init(container: HTMLElement): Promise<void> {
    await this.app.init({
      resizeTo: window,
      backgroundColor: 0x0a0a0c,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });
    container.appendChild(this.app.canvas);

    await loadAllPrototypes();
    await loadGameAssets();

    this.app.stage.addChild(this.mapContainer);

    this.mapRenderer = new MapRenderer(this.mapContainer);

    this.cameraControl = new CameraControl(this.mapContainer, {
      minScale: 0.6,
      maxScale: 1.8,
      boundsRadius: 1200,
    });
    
    this.cameraControl.attach(this.app, this.app.canvas as HTMLCanvasElement);

    this.currentWorld = await MockApiService.getSectorData();

    this.app.ticker.add(() => {
      if (this.currentWorld) {
        this.mapRenderer.updateCulling();
      }
    });

    this.mainMenu = new MainMenu(() => this.startGame());
    this.mainMenu.mount(container);
    this.mainMenu.setUserInfo('Командующий');
  }

  private async startGame(): Promise<void> {
    if (!this.currentWorld) return;

    this.mainMenu.hide();

    this.mapRenderer.render(this.currentWorld);
  }
}