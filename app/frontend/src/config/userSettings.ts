export interface UserSettings {
  camera?: {
    minScale?: number;
    maxScale?: number;
    moveSpeed?: number;
    zoomStep?: number;
  };

  rendering?: {
    backgroundColor?: number;
  };
}

/**
 * User-editable settings are data, not client defaults. A Django-backed API
 * can persist this shape without leaking transport concerns into game systems.
 */
export function mergeUserSettings<T extends object>(
  defaults: T,
  settings: Partial<T> | undefined,
): T {
  if (!settings) {
    return defaults;
  }

  return {
    ...defaults,
    ...settings,
  };
}
