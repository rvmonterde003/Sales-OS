import { useAuth } from '../context/AuthContext';

export function useRole() {
  const { dbUser } = useAuth();
  const role = dbUser?.role || 'member';
  const userId = dbUser?.id;

  const isAdmin = role === 'admin';
  const isRep = role === 'rep';
  const isMember = role === 'member';

  /** Can the current user modify this record (by owner_id)? */
  const canEdit = (ownerId?: number) => {
    if (isAdmin) return true;
    if (isRep && ownerId !== undefined) return ownerId === userId;
    return false;
  };

  /** Can the current user create records? (admin + rep only) */
  const canCreate = isAdmin || isRep;

  /** Can the current user see individual rep data? */
  const canSeeRepData = isAdmin || isRep;

  return { isAdmin, isRep, isMember, canEdit, canCreate, canSeeRepData, userId };
}
