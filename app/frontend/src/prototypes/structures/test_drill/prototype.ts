import {
  getEntityTextureUrl,
} from '@/shared/utils/assets';

import type {
  BuildingPrototype,
} from '../../base/types';

const textureUrl =
  getEntityTextureUrl(
    import.meta.url,
    './graphics/test_drill.png',
  );

export const prototype: BuildingPrototype = {
  type: 'structure',

  id: 'test_drill',

  name: 'Тестовый бур',

  width: 2,
  height: 2,

  render: {
    type: 'animated',

    animations: {
      idle: {
        fps: 4,
        loop: true,

        frames: {
          source: {
            key: 'test_drill',
            url: textureUrl,
          },

          grid: {
            frameWidth: 64,
            frameHeight: 64,
            startX: 0,
            startY: 0,
            count: 4,
          },
        },
      },

      working: {
        fps: 8,
        loop: true,

        frames: {
          source: {
            key: 'test_drill',
            url: textureUrl,
          },

          grid: {
            frameWidth: 64,
            frameHeight: 64,
            startX: 0,
            startY: 64,
            count: 4,
          },
        },
      },

      spawning: {
        fps: 10,
        loop: false,

        frames: {
          source: {
            key: 'test_drill',
            url: textureUrl,
          },

          grid: {
            frameWidth: 64,
            frameHeight: 64,
            startX: 0,
            startY: 0,
            count: 4,
          },
        },
      },
    },
  },
};