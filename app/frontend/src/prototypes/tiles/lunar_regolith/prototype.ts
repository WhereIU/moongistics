import {
  getEntityTextureUrl,
} from '@/shared/assets/assetUrl';

import type {
  TilePrototype,
} from '../../types';

export const prototype: TilePrototype = {
  type: 'tile',

  id: 'lunar_regolith',

  name: 'Лунный реголит',

  render: {
    type: 'sprite',

    tint: 0xdddddd,

    static: {
      source: {
        key: 'lunar_regolith',

        url:
          getEntityTextureUrl(
            import.meta.url,
            './graphics/lunar_regolith.png',
          ),
      },

      grid: {
        frameWidth: 64,
        frameHeight: 64,
        startY: 0,
        count: 16,
      },
    },
  },
};