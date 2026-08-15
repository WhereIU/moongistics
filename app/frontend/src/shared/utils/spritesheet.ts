import type { FrameRect, SpritesheetGrid } from '@/prototypes/base/types';

export function generateGridFrames(
  imageWidth: number,
  imageHeight: number,
  config: SpritesheetGrid,
): FrameRect[] {
  const {
    frameWidth,
    frameHeight,
    startY = 0,
    count,
  } = config;

  if (frameWidth <= 0 || frameHeight <= 0) return [];

  const maxCols = Math.floor(imageWidth / frameWidth);
  const maxRows = Math.max(0, Math.floor((imageHeight - startY) / frameHeight));
  const availableFrames = maxCols * maxRows;
  const totalFrames = count === undefined
    ? availableFrames
    : Math.min(count, availableFrames);

  const frames: FrameRect[] = [];

  for (let index = 0; index < totalFrames; index += 1) {
    const column = index % maxCols;
    const row = Math.floor(index / maxCols);

    frames.push({
      x: column * frameWidth,
      y: startY + row * frameHeight,
      w: frameWidth,
      h: frameHeight,
    });
  }

  return frames;
}
