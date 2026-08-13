import { Container, Sprite, Texture, Cache, Assets } from 'pixi.js';
import type { GameWorldData } from '@/shared/api/mockApi';

export class MapRenderer {
  private container: Container;
  private tileSprites: { sprite: Sprite; worldX: number; worldY: number }[] = [];
  private worldData?: GameWorldData;

  constructor(targetContainer: Container) {
    this.container = targetContainer;
  }

  public render(world: GameWorldData): void {
    this.worldData = world;
    this.container.removeChildren();
    this.tileSprites = [];

    if (!world.tiles || world.tiles.length === 0) return;

    this.container.x = window.innerWidth / 2;
    this.container.y = window.innerHeight / 2;

    for (const tileData of world.tiles) {
      const variantKey = `${tileData.baseType}_${tileData.variant ?? 0}`;
      let texture = Cache.get<Texture>(variantKey) || Assets.get<Texture>(tileData.baseType) || Texture.EMPTY;

      if (texture.source) {
        texture.source.scaleMode = 'nearest';
      }

      const sprite = new Sprite(texture);
      sprite.anchor.set(0.5);
      sprite.x = tileData.x;
      sprite.y = tileData.y;

      if (!tileData.isPlayable) {
        sprite.tint = 0x555566;
      } else {
        sprite.tint = 0xffffff;
      }

      this.container.addChild(sprite);
      this.tileSprites.push({ sprite, worldX: tileData.x, worldY: tileData.y });
    }
  }

  public clampCamera(): void {
    if (!this.worldData) return;

    const scale = this.container.scale.x;
    const maxPixelOffset = this.worldData.playableRadius * this.worldData.tileSize * scale;

    const minContainerX = window.innerWidth / 2 - maxPixelOffset;
    const maxContainerX = window.innerWidth / 2 + maxPixelOffset;
    const minContainerY = window.innerHeight / 2 - maxPixelOffset;
    const maxContainerY = window.innerHeight / 2 + maxPixelOffset;

    this.container.x = Math.max(minContainerX, Math.min(maxContainerX, this.container.x));
    this.container.y = Math.max(minContainerY, Math.min(maxContainerY, this.container.y));
  }

  public updateCulling(): void {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const scale = this.container.scale.x;
    const padding = 120;

    for (const item of this.tileSprites) {
      const screenX = this.container.x + item.worldX * scale;
      const screenY = this.container.y + item.worldY * scale;

      const isVisible =
        screenX >= -padding &&
        screenX <= screenWidth + padding &&
        screenY >= -padding &&
        screenY <= screenHeight + padding;

      item.sprite.visible = isVisible;
    }
  }
}