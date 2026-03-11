import prisma from './prisma';
import { normalizeRoom } from './helpers';

/** One-time roomNumber normalization migration */
export async function migrateRoomNumbers() {
  try {
    const records = await prisma.residentRecord.findMany({
      select: { id: true, roomNumber: true },
    });
    for (const r of records) {
      const clean = normalizeRoom(r.roomNumber);
      if (clean !== r.roomNumber) {
        await prisma.residentRecord.update({
          where: { id: r.id },
          data: { roomNumber: clean },
        });
      }
    }
    console.log('[MIGRATION] roomNumber normalization complete');
  } catch (err) {
    console.error('[MIGRATION] roomNumber normalization failed:', err);
  }
}
