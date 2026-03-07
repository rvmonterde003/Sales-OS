import { useState } from 'react';
import { Scale } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    let err: string | null;
    if (isSignUp) {
      err = await signup(email, password, firstName, lastName);
    } else {
      err = await login(email, password);
    }
    if (err) setError(err);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 flex items-center justify-center">
      <div className="w-[400px]">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Scale className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[24px] font-bold text-gray-900">Sales OS</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
          <h2 className="text-[16px] font-semibold text-gray-900 text-center mb-1">
            {isSignUp ? 'Create account' : 'Welcome back'}
          </h2>
          <p className="text-[13px] text-gray-500 text-center mb-5">
            {isSignUp ? 'Sign up to get started' : 'Sign in to your account'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            {isSignUp && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-gray-500 mb-1">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-gray-500 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="Min 6 characters"
              />
            </div>

            {error && (
              <div className="text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-violet-600 text-white text-[14px] font-medium rounded-lg hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
              className="text-[12px] text-violet-600 hover:text-violet-700"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>

        <p className="text-[11px] text-gray-400 text-center mt-4">
          Sales Operating System
        </p>
      </div>
    </div>
  );
}
