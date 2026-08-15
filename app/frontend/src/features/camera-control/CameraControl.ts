import { Application, Container, Point, Ticker } from 'pixi.js';

export interface CameraOptions {
  minScale?: number;
  maxScale?: number;
  boundsRadius?: number;
  moveSpeed?: number;
  zoomStep?: number;
}

export interface ViewportBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export class CameraControl {
  private readonly target: Container;
  private app?: Application;
  private interactionElement?: HTMLElement;
  private isDragging = false;
  private startPointerPos = new Point();
  private startContainerPos = new Point();

  private readonly minScale: number;
  private readonly maxScale: number;
  private readonly boundsRadius: number;
  private readonly moveSpeed: number;
  private readonly zoomStep: number;
  private readonly keys: Record<string, boolean> = {};

  constructor(targetContainer: Container, options: CameraOptions = {}) {
    this.target = targetContainer;
    this.minScale = options.minScale ?? 0.5;
    this.maxScale = options.maxScale ?? 2.0;
    this.boundsRadius = options.boundsRadius ?? 1000;
    this.moveSpeed = options.moveSpeed ?? 720;
    this.zoomStep = options.zoomStep ?? 1.1;
  }

  public attach(app: Application, interactionElement: HTMLElement): void {
    this.app = app;
    this.interactionElement = interactionElement;

    interactionElement.addEventListener('pointerdown', this.onPointerDown);
    interactionElement.addEventListener('wheel', this.onWheel, { passive: false });
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('blur', this.onWindowBlur);
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
    window.removeEventListener('blur', this.onWindowBlur);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);

    this.resetKeys();
    this.isDragging = false;

    if (this.app) {
      this.app.ticker.remove(this.updateKeyboardMovement, this);
    }

    this.app = undefined;
    this.interactionElement = undefined;
  }

  public getViewportBounds(screenWidth: number, screenHeight: number): ViewportBounds {
    const scale = this.target.scale.x || 1;

    return {
      minX: -this.target.x / scale,
      maxX: (screenWidth - this.target.x) / scale,
      minY: -this.target.y / scale,
      maxY: (screenHeight - this.target.y) / scale,
    };
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    this.keys[event.code] = true;
  };

  private onKeyUp = (event: KeyboardEvent): void => {
    this.keys[event.code] = false;
  };

  private onWindowBlur = (): void => {
    this.resetKeys();
    this.isDragging = false;
  };

  private resetKeys(): void {
    for (const key of Object.keys(this.keys)) {
      delete this.keys[key];
    }
  }

  private updateKeyboardMovement = (ticker: Ticker): void => {
    let dx = 0;
    let dy = 0;

    if (this.keys['KeyW'] || this.keys['ArrowUp']) dy += this.moveSpeed;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) dy -= this.moveSpeed;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) dx += this.moveSpeed;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) dx -= this.moveSpeed;

    if (dx !== 0 || dy !== 0) {
      const deltaSeconds = Math.min(ticker.deltaMS / 1000, 0.05);
      this.moveBy(dx * deltaSeconds, dy * deltaSeconds);
    }
  };

  private moveBy(dx: number, dy: number): void {
    const nextX = this.target.x + dx;
    const nextY = this.target.y + dy;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const distance = Math.hypot(nextX - centerX, nextY - centerY);

    if (distance <= this.boundsRadius) {
      this.target.position.set(nextX, nextY);
      return;
    }

    const angle = Math.atan2(nextY - centerY, nextX - centerX);
    this.target.position.set(
      centerX + Math.cos(angle) * this.boundsRadius,
      centerY + Math.sin(angle) * this.boundsRadius,
    );
  }

  private onPointerDown = (event: PointerEvent): void => {
    if (event.button !== 0) return;

    this.isDragging = true;
    this.interactionElement?.setPointerCapture?.(event.pointerId);
    this.startPointerPos.set(event.clientX, event.clientY);
    this.startContainerPos.set(this.target.x, this.target.y);
  };

  private onPointerMove = (event: PointerEvent): void => {
    if (!this.isDragging) return;

    const dx = event.clientX - this.startPointerPos.x;
    const dy = event.clientY - this.startPointerPos.y;
    this.target.position.set(
      this.startContainerPos.x + dx,
      this.startContainerPos.y + dy,
    );

    this.clampToRadius();
  };

  private onPointerUp = (event: PointerEvent): void => {
    this.isDragging = false;
    this.interactionElement?.releasePointerCapture?.(event.pointerId);
  };

  private onWheel = (event: WheelEvent): void => {
    event.preventDefault();

    const oldScale = this.target.scale.x;
    const direction = event.deltaY < 0 ? this.zoomStep : 1 / this.zoomStep;
    const newScale = Math.max(
      this.minScale,
      Math.min(this.maxScale, oldScale * direction),
    );

    if (newScale === oldScale) return;

    const localX = (event.clientX - this.target.x) / oldScale;
    const localY = (event.clientY - this.target.y) / oldScale;

    this.target.scale.set(newScale);
    this.target.position.set(
      event.clientX - localX * newScale,
      event.clientY - localY * newScale,
    );

    this.clampToRadius();
  };

  private clampToRadius(): void {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const dx = this.target.x - centerX;
    const dy = this.target.y - centerY;
    const distance = Math.hypot(dx, dy);

    if (distance <= this.boundsRadius || distance === 0) return;

    const ratio = this.boundsRadius / distance;
    this.target.position.set(
      centerX + dx * ratio,
      centerY + dy * ratio,
    );
  }
}
