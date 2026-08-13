import { getEntityTextureUrl } from '@/shared/utils/assets';
import type { TilePrototype } from '../../base/types';

export const prototype: TilePrototype = {
  type: 'tile',
  id: 'lunar_regolith',
  name: 'Лунный реголит',
  textureKey: 'lunar_regolith',
  textureUrl: getEntityTextureUrl(import.meta.url, './graphics/lunar_regolith.png'),
  gridConfig: {
    frameWidth: 64,
    frameHeight: 64,
    startY: 0,
    count: 16,
  },
  tint: 0xdddddd,
};