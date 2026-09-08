import { z } from 'zod';

// No payload required for enable/disable — action is determined by route
// Keep schema here for future extensibility (e.g., reason or note fields)
export const enableEmergencyModeSchema = z.object({}).optional();

export const disableEmergencyModeSchema = z.object({}).optional();

export type EnableEmergencyModeInput = z.infer<typeof enableEmergencyModeSchema>;
export type DisableEmergencyModeInput = z.infer<typeof disableEmergencyModeSchema>;
