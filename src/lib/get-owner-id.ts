import { cookies } from 'next/headers';
import { OWNER_COOKIE } from '@/middleware';

export async function getOwnerId(): Promise<string> {
  const cookieStore = await cookies();
  const ownerId = cookieStore.get(OWNER_COOKIE)?.value;

  if (!ownerId) {
    throw new Error("owner_id cookie отсутствует — middleware не сработал");
  }

  return ownerId;
}