/** Strip sensitive fields from any User object before sending to clients. */
export function sanitizeUser<T extends { password?: string | null; expoPushToken?: string | null; providerId?: string | null }>(user: T): Omit<T, 'password' | 'expoPushToken' | 'providerId'> {
  const { password: _p, expoPushToken: _e, providerId: _pr, ...safe } = user as any;
  return safe;
}

/** Strip '호' suffix and surrounding whitespace for consistent roomNumber storage. */
export function normalizeRoom(room: string): string {
  return room.replace(/호/g, '').trim();
}
