import type { UserSettings } from '@/config/userSettings';

/**
 * Persistence boundary for player-editable settings.
 * Django/HTTP can implement this later without changing game systems.
 */
export interface UserSettingsApi {
  getUserSettings(): Promise<UserSettings>;
  saveUserSettings(settings: UserSettings): Promise<void>;
}
