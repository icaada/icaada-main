import { notFound } from 'next/navigation';
import { UsersManager } from '@/components/admin/users-manager';
import { getCurrentActor } from '@/lib/auth/auth-guard';

// Admin-only screen: editors get a 404 (the API rejects them with 403 regardless).
export default async function AdminUsersPage() {
  const actor = await getCurrentActor();
  if (actor?.role !== 'ADMIN') notFound();
  return <UsersManager currentUserId={actor.id} />;
}
