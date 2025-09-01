// Client-side validation limits
export const RECORDING_LIMITS = {
  MAX_DURATION_SECONDS: 8 * 60, // 8 minutes
  MAX_FILE_SIZE_MB: 15,
  MIN_INTERVAL_SECONDS: 20,
  MAX_DAILY_RECORDINGS: 10,
  COOLDOWN_ON_FAIL_SECONDS: 45,
  ALLOWED_TYPES: ['audio/m4a', 'audio/aac', 'audio/wav'],
};

export function validateAudioFile(
  uri: string,
  duration: number,
  fileSize?: number
): { valid: boolean; error?: string } {
  if (duration > RECORDING_LIMITS.MAX_DURATION_SECONDS) {
    return { valid: false, error: 'Recording too long (max 8 minutes)' };
  }

  if (fileSize && fileSize > RECORDING_LIMITS.MAX_FILE_SIZE_MB * 1024 * 1024) {
    return { valid: false, error: 'File too large (max 15MB)' };
  }

  return { valid: true };
}
