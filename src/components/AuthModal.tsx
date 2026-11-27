import React, { useState } from 'react';
import { LogOut, User, X } from 'lucide-react';
import type { TranslationBundle } from '../i18n/translations';
import type { LanguageCode, UserProfile } from '../types/booknote';
import { loginAccount, logoutAccount, registerAccount } from '../utils/api';
import { soundFX } from '../utils/sound';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  language: LanguageCode;
  t: TranslationBundle;
  onAuthSuccess: (user: UserProfile) => void;
  onLoggedOut: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  language,
  t,
  onAuthSuccess,
  onLoggedOut,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res =
        mode === 'register'
          ? await registerAccount({
              username,
              displayName: displayName || username,
              password,
              language,
            })
          : await loginAccount({ username, password });
      soundFX.playStarChime();
      onAuthSuccess(res.user);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutAccount();
      soundFX.playTap();
      onLoggedOut();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#22153a]/55 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#faf6ff] border-2 border-white rounded-3xl p-6 shadow-[0_24px_60px_rgba(34,20,62,0.45)] relative"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-2 rounded-full text-[#6f5a91] hover:bg-[#ede4fa] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {user ? (
          <div className="text-center py-2">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#9c78d4] to-[#6845a3] text-white flex items-center justify-center mx-auto mb-3 shadow-md">
              <User className="w-8 h-8" />
            </div>
            <h2 className="font-display text-2xl font-bold text-[#2f1f4c]">{user.displayName}</h2>
            <p className="text-sm text-[#6f5a91] mt-0.5">@{user.username}</p>
            <p className="mt-3 text-sm text-[#4e3b70] bg-white rounded-2xl px-4 py-3 border border-[#eadffc]">
              {t.savedAccount} · ★ {user.stars}
            </p>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loading}
              className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#f5dce4] hover:bg-[#efc9d5] text-[#8d2948] font-display font-bold text-sm cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>{t.signOut}</span>
            </button>
          </div>
        ) : (
          <div>
            <h2 className="font-display text-2xl font-bold text-[#2f1f4c] pr-8">
              {mode === 'login' ? t.authTitleLogin : t.authTitleRegister}
            </h2>
            <p className="text-xs sm:text-sm text-[#614d82] mt-1 mb-5">
              {t.authSubtitle}
            </p>

            {error && (
              <div className="mb-4 px-3.5 py-2.5 rounded-2xl bg-[#fde6ec] border border-[#f5b8c9] text-[#9b2447] text-xs sm:text-sm font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#4a356e] mb-1">
                  {t.usernameLabel}
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={40}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#dfd2f5] focus:border-[#7f58c9] focus:outline-none text-sm text-[#2c2142]"
                />
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-[#4a356e] mb-1">
                    {t.displayNameLabel}
                  </label>
                  <input
                    type="text"
                    maxLength={60}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#dfd2f5] focus:border-[#7f58c9] focus:outline-none text-sm text-[#2c2142]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#4a356e] mb-1">
                  {t.passwordLabel}
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  maxLength={128}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#dfd2f5] focus:border-[#7f58c9] focus:outline-none text-sm text-[#2c2142]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-game-purple w-full py-2.5 rounded-full text-white font-display font-bold text-base cursor-pointer disabled:opacity-60 mt-2"
              >
                {mode === 'login' ? t.loginAction : t.registerAction}
              </button>
            </form>

            <button
              type="button"
              onClick={() => {
                setError(null);
                setMode(mode === 'login' ? 'register' : 'login');
              }}
              className="mt-4 w-full text-center text-xs sm:text-sm font-semibold text-[#6845a3] hover:underline cursor-pointer"
            >
              {mode === 'login' ? t.switchToRegister : t.switchToLogin}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
