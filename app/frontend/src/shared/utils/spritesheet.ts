import type { FrameRect, SpritesheetGrid } from '@/entities/base/types';

export function generateGridFrames(
  imageWidth: number,
  config: SpritesheetGrid
): FrameRect[] {
  const { frameWidth, frameHeight, startY = 0, count } = config;
  const maxCols = Math.floor(imageWidth / frameWidth);
  const totalFrames = count ? Math.min(count, maxCols) : maxCols;

  const frames: FrameRect[] = [];

  for (let i = 0; i < totalFrames; i++) {
    frames.push({
      x: i * frameWidth,
      y: startY,
      w: frameWidth,
      h: frameHeight,
    });
  }

  return frames;
}