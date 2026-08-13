import { Container, Point, Application } from 'pixi.js';

export interface CameraOptions {
  minScale?: number;
  maxScale?: number;
  boundsRadius?: number;
  moveSpeed?: number;
}

export interface ViewportBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export class CameraControl {
  private target: Container;
  private app?: Application;
  private interactionElement?: HTMLElement;
  private isDragging = false;
  private startPointerPos = new Point();
  private startContainerPos = new Point();

  private minScale: number;
  private maxScale: number;
  private boundsRadius: number;
  private moveSpeed: number;

  private keys: Record<string, boolean> = {};

  constructor(targetContainer: Container, options: CameraOptions = {}) {
    this.target = targetContainer;
    this.minScale = options.minScale ?? 0.5;
    this.maxScale = options.maxScale ?? 2.0;
    this.boundsRadius = options.boundsRadius ?? 1000;
    this.moveSpeed = options.moveSpeed ?? 12;
  }

  public attach(app: Application, interactionElement: HTMLElement): void {
    this.app = app;
    this.interactionElement = interactionElement;

    interactionElement.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    interactionElement.addEventListener('wheel', this.onWheel, { passive: false });

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);

    app.ticker.add(this.updateKeyboardMovement, this);
  }

  public detach(): void {
    if (this.interactionElement) {
      this.interactionElement.removeEventListener('pointerdown', this.onPointerDown);
      this.interactionElement.removeEventListener('wheel', this.onWheel);
    }
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);

    if (this.app) {
      this.app.ticker.remove(this.updateKeyboardMovement, this);
    }
  }

  public getViewportBounds(screenWidth: number, screenHeight: number): ViewportBounds {
    const scale = this.target.scale.x;

    const minX = (0 - this.target.x) / scale;
    const minY = (0 - this.target.y) / scale;
    const maxX = (screenWidth - this.target.x) / scale;
    const maxY = (screenHeight - this.target.y) / scale;

    return { minX, maxX, minY, maxY };
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    this.keys[e.code] = true;
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keys[e.code] = false;
  };

  private updateKeyboardMovement = (): void => {
    let dx = 0;
    let dy = 0;

    if (this.keys['KeyW'] || this.keys['ArrowUp']) dy += this.moveSpeed;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) dy -= this.moveSpeed;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) dx += this.moveSpeed;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) dx -= this.moveSpeed;

    if (dx !== 0 || dy !== 0) {
      this.moveBy(dx, dy);
    }
  };

  private moveBy(dx: number, dy: number): void {
    let newX = this.target.x + dx;
    let newY = this.target.y + dy;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const dist = Math.hypot(newX - centerX, newY - centerY);

    if (dist > this.boundsRadius) {
      const angle = Math.atan2(newY - centerY, newX - centerX);
      newX = centerX + Math.cos(angle) * this.boundsRadius;
      newY = centerY + Math.sin(angle) * this.boundsRadius;
    }

    this.target.x = newX;
    this.target.y = newY;
  }

  private onPointerDown = (e: PointerEvent): void => {
    if (e.button === 2) return;
    this.isDragging = true;
    this.startPointerPos.set(e.clientX, e.clientY);
    this.startContainerPos.set(this.target.x, this.target.y);
  };

  private onPointerMove = (e: PointerEvent): void => {
    if (!this.isDragging) return;
    const dx = e.clientX - this.startPointerPos.x;
    const dy = e.clientY - this.startPointerPos.y;
    this.moveBy(dx - (this.target.x - this.startContainerPos.x), dy - (this.target.y - this.startContainerPos.y));
  };

  private onPointerUp = (): void => {
    this.isDragging = false;
  };

  private onWheel = (e: WheelEvent): void => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const currentScale = this.target.scale.x;
    let newScale = Math.max(this.minScale, Math.min(this.maxScale, currentScale * zoomFactor));
    this.target.scale.set(newScale);
  };
}