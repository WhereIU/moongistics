import type { Ticker } from 'pixi.js';
import type { Simulation } from './Simulation';

export interface GameLoopOptions {
  updatesPerSecond?: number;
  maxTicksPerFrame?: number;
}

export class GameLoop {
  private readonly simulation: Simulation;
  private readonly tickDeltaSeconds: number;
  private readonly maxTicksPerFrame: number;

  private accumulator = 0;

  public constructor(
    simulation: Simulation,
    options: GameLoopOptions = {},
  ) {
    this.simulation = simulation;

    const updatesPerSecond =
      options.updatesPerSecond ?? 20;

    this.tickDeltaSeconds =
      1 / updatesPerSecond;

    this.maxTicksPerFrame =
      options.maxTicksPerFrame ?? 5;
  }

  public update(
    ticker: Ticker,
  ): number {
    const frameDeltaSeconds =
      Math.min(
        ticker.deltaMS / 1000,
        0.25,
      );

    this.accumulator +=
      frameDeltaSeconds;

    let tickCount = 0;

    while (
      this.accumulator >= this.tickDeltaSeconds &&
      tickCount < this.maxTicksPerFrame
    ) {
      this.simulation.update(
        this.tickDeltaSeconds,
      );

      this.accumulator -=
        this.tickDeltaSeconds;

      tickCount += 1;
    }

    if (
      tickCount === this.maxTicksPerFrame &&
      this.accumulator >= this.tickDeltaSeconds
    ) {
      this.accumulator = 0;
    }

    return (
      this.accumulator /
      this.tickDeltaSeconds
    );
  }
}