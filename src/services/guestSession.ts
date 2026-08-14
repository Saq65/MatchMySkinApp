import AsyncStorage from '@react-native-async-storage/async-storage';

const GUEST_SESSION_KEY = 'matchmyskin.guestSessionId';

function generateUuid(): string {
  // RFC 4122-ish v4 UUID without relying on the Web Crypto API, which Hermes
  // doesn't provide by default.
  /* eslint-disable no-bitwise */
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
  /* eslint-enable no-bitwise */
}

let cachedGuestSessionId: string | null = null;

export async function getGuestSessionId(): Promise<string> {
  if (cachedGuestSessionId) {
    return cachedGuestSessionId;
  }

  const stored = await AsyncStorage.getItem(GUEST_SESSION_KEY);
  if (stored) {
    cachedGuestSessionId = stored;
    return stored;
  }

  const created = generateUuid();
  await AsyncStorage.setItem(GUEST_SESSION_KEY, created);
  cachedGuestSessionId = created;
  return created;
}
