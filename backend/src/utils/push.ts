import { Expo, ExpoPushMessage } from 'expo-server-sdk';

const expo = new Expo();

/**
 * 유효한 Expo 푸시 토큰 목록에 알림을 일괄 전송한다.
 * @returns 실제 전송된 메시지 수
 */
export async function sendPushToTokens(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<number> {
  const validTokens = tokens.filter((t) => Expo.isExpoPushToken(t));
  if (validTokens.length === 0) return 0;

  const messages: ExpoPushMessage[] = validTokens.map((pushToken) => ({
    to: pushToken,
    sound: 'default',
    title,
    body,
    data: data ?? {},
  }));

  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (err) {
      console.error('Push chunk error:', err);
    }
  }

  return validTokens.length;
}
