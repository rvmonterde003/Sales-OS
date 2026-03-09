import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { Lock, Mail, UserPlus, Shield, Trash2, Copy, Check } from 'lucide-react';

export default function ProfilePage() {
  const { dbUser, allUsers, invitations, changePassword, inviteUser, updateUserRole, removeUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMsg, setPwMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [pwSubmitting, setPwSubmitting] = useState(false);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'rep' | 'member'>('rep');
  const [inviteMsg, setInviteMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [copiedToken, setCopiedToken] = useState<number | null>(null);

  const [confirmRemove, setConfirmRemove] = useState<number | null>(null);

  const isAdmin = dbUser?.role === 'admin';

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (newPassword.length < 6) { setPwMsg({ type: 'err', text: 'Password must be at least 6 characters.' }); return; }
    if (newPassword !== confirmPassword) { setPwMsg({ type: 'err', text: 'Passwords do not match.' }); return; }
    setPwSubmitting(true);
    const err = await changePassword(newPassword);
    if (err) { setPwMsg({ type: 'err', text: err }); }
    else { setPwMsg({ type: 'ok', text: 'Password changed successfully.' }); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }
    setPwSubmitting(false);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteMsg(null);
    if (!inviteEmail.trim()) return;
    setInviteSubmitting(true);
    const err = await inviteUser(inviteEmail.trim(), inviteRole);
    if (err) { setInviteMsg({ type: 'err', text: err }); }
    else { setInviteMsg({ type: 'ok', text: `Invitation sent to ${inviteEmail.trim()}` }); setInviteEmail(''); }
    setInviteSubmitting(false);
  };

  const handleCopyLink = (token: string, id: number) => {
    const link = `${window.location.origin}/#signup?token=${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(id);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleRoleChange = async (userId: number, role: 'admin' | 'rep' | 'member') => {
    await updateUserRole(userId, role);
  };

  const handleRemoveUser = async (userId: number) => {
    await removeUser(userId);
    setConfirmRemove(null);
  };

  const activeUsers = allUsers.filter(u => u.is_active);
  const pendingInvites = invitations.filter(i => !i.accepted_at);

  return (
    <div className="flex flex-col h-[calc(100vh-46px)]">
      <div className="flex items-center px-5 py-2 border-b border-gray-200 bg-white shrink-0">
        <span className="text-[13px] font-medium text-gray-900">Profile</span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 max-w-[900px]">
        {/* User Info */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-[16px]">
            {dbUser?.first_name[0]}{dbUser?.last_name[0]}
          </div>
          <div>
            <div className="text-[16px] font-semibold text-gray-900">{dbUser?.first_name} {dbUser?.last_name}</div>
            <div className="text-[12px] text-gray-500">{dbUser?.email}</div>
            <StatusBadge status={dbUser?.role || ''} variant="tag" />
          </div>
        </div>

        {/* Change Password */}
        <div className="border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-4 h-4 text-gray-500" />
            <h2 className="text-[13px] font-semibold text-gray-900">Change Password</h2>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-3 max-w-[400px]">
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1">Current Password</label>
              <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1">New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="Min 6 characters" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1">Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
            </div>
            {pwMsg && (
              <div className={`text-[12px] px-3 py-2 rounded-md border ${pwMsg.type === 'ok' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                {pwMsg.text}
              </div>
            )}
            <button type="submit" disabled={pwSubmitting}
              className="px-4 py-2 text-[13px] bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:opacity-40 font-medium transition-colors">
              {pwSubmitting ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* Admin: User Management */}
        {isAdmin && (
          <>
            {/* Invite */}
            <div className="border border-gray-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <UserPlus className="w-4 h-4 text-gray-500" />
                <h2 className="text-[13px] font-semibold text-gray-900">Invite User</h2>
              </div>
              <form onSubmit={handleInvite} className="flex items-end gap-3">
                <div className="flex-1 max-w-[280px]">
                  <label className="block text-[12px] font-medium text-gray-500 mb-1">Email</label>
                  <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="user@company.com" />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-gray-500 mb-1">Role</label>
                  <select value={inviteRole} onChange={e => setInviteRole(e.target.value as 'rep' | 'member')}
                    className="border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent">
                    <option value="rep">Rep</option>
                    <option value="member">Member</option>
                  </select>
                </div>
                <button type="submit" disabled={inviteSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2 text-[13px] bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:opacity-40 font-medium transition-colors">
                  <Mail className="w-3.5 h-3.5" /> {inviteSubmitting ? 'Sending...' : 'Send Invite'}
                </button>
              </form>
              {inviteMsg && (
                <div className={`mt-3 text-[12px] px-3 py-2 rounded-md border ${inviteMsg.type === 'ok' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                  {inviteMsg.text}
                </div>
              )}

              {/* Pending invites */}
              {pendingInvites.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-[12px] font-medium text-gray-500 mb-2">Pending Invitations</h3>
                  <div className="space-y-1.5">
                    {pendingInvites.map(inv => (
                      <div key={inv.id} className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                        <div>
                          <span className="text-[12px] text-gray-900">{inv.email}</span>
                          <span className="text-[10px] text-gray-400 ml-2">{inv.role}</span>
                        </div>
                        <button onClick={() => handleCopyLink(inv.token, inv.id)}
                          className="flex items-center gap-1 text-[11px] text-violet-600 hover:text-violet-700 font-medium">
                          {copiedToken === inv.id ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy Link</>}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* All Users */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-gray-500" />
                <h2 className="text-[13px] font-semibold text-gray-900">Team Members</h2>
                <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{activeUsers.length}</span>
              </div>
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/60">
                    <th className="text-left font-medium text-gray-500 px-3 py-2">Name</th>
                    <th className="text-left font-medium text-gray-500 px-3 py-2">Email</th>
                    <th className="text-left font-medium text-gray-500 px-3 py-2">Role</th>
                    <th className="text-right font-medium text-gray-500 px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeUsers.map(user => (
                    <tr key={user.id} className="border-b border-gray-100">
                      <td className="px-3 py-2.5 font-medium text-gray-900">{user.first_name} {user.last_name}</td>
                      <td className="px-3 py-2.5 text-gray-500 text-[12px]">{user.email}</td>
                      <td className="px-3 py-2.5">
                        {user.id === dbUser?.id ? (
                          <StatusBadge status={user.role} variant="tag" />
                        ) : (
                          <select value={user.role} onChange={e => handleRoleChange(user.id, e.target.value as 'admin' | 'rep' | 'member')}
                            className="border border-gray-200 rounded px-2 py-0.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-violet-400">
                            <option value="admin">Admin</option>
                            <option value="rep">Rep</option>
                            <option value="member">Member</option>
                          </select>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        {user.id !== dbUser?.id && (
                          confirmRemove === user.id ? (
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => handleRemoveUser(user.id)}
                                className="text-[11px] text-white bg-red-500 px-2 py-0.5 rounded hover:bg-red-600 font-medium">Remove</button>
                              <button onClick={() => setConfirmRemove(null)}
                                className="text-[11px] text-gray-500 px-2 py-0.5 rounded hover:bg-gray-100">Cancel</button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmRemove(user.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors" title="Remove user">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
