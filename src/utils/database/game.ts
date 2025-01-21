import { db } from './db';

export async function resetGame() {
  return await db.delete();
}