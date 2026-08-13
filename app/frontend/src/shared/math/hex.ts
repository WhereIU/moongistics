export interface HexCoord {
  q: number;
  r: number;
}

export const HEX_RADIUS = 32;

export function hexToPixel(hex: HexCoord, radius: number = HEX_RADIUS): { x: number; y: number } {
  const x = radius * Math.sqrt(3) * (hex.q + hex.r / 2);
  const y = radius * 1.5 * hex.r;
  return { x, y };
}