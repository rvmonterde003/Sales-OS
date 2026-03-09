import { useAuth } from '../context/AuthContext';

export function useRole() {
  const { dbUser } = useAuth();
  const role = dbUser?.role || 'rep';
  const userId = dbUser?.id;

  const isExec = role === 'exec';
  const isAdmin = role === 'admin';
  const isRep = role === 'rep';

  /** Can the current user modify this record (by owner_id)? */
  const canEdit = (ownerId?: number) => {
    if (isExec || isAdmin) return true;
    if (isRep && ownerId !== undefined) return ownerId === userId;
    return false;
  };

  /** Can the current user create records? (exec + admin + rep) */
  const canCreate = isExec || isAdmin || isRep;

  /** Can the current user see individual rep data? */
  const canSeeRepData = isExec || isAdmin || isRep;

  return { isExec, isAdmin, isRep, canEdit, canCreate, canSeeRepData, userId };
}
