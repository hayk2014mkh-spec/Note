import React from 'react';
import { ArrowLeft, BookOpen, Globe, Star, User, Volume2, VolumeX } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../data/catalog';
import type { TranslationBundle } from '../i18n/translations';
import type { AppScreen, LanguageCode, UserProfile } from '../types/booknote';

interface TopBarProps {
  screen: AppScreen;
  onBack: () => void;
  onOpenShelf: () => void;
  onOpenLanguage: () => void;
  onOpenAuth: () => void;
  language: LanguageCode;
  stars: number;
  user: UserProfile | null;
  muted: boolean;
  onToggleMute: () => void;
  t: TranslationBundle;
  notebookCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  screen,
  onBack,
  onOpenShelf,
  onOpenLanguage,
  onOpenAuth,
  language,
  stars,
  user,
  muted,
  onToggleMute,
  t,
  notebookCount,
}) => {
  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2 flex items-center justify-between gap-4">
      {/* Left Zone: Back / My Books */}
      <div className="flex items-center gap-2.5 shrink-0">
        {screen !== 'picker' && (
          <button
            type="button"
            onClick={onBack}
            className="btn-game-purple inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-display font-semibold text-sm sm:text-base transition-transform cursor-pointer whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.back}</span>
          </button>
        )}

        {screen !== 'shelf' && (
          <button
            type="button"
            onClick={onOpenShelf}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 hover:bg-white text-[#4b3575] border-2 border-white shadow-[0_4px_12px_rgba(61,35,107,0.18)] font-display font-semibold text-sm sm:text-base transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <BookOpen className="w-4 h-4 text-[#7c56bd]" />
            <span>{t.myBooks}</span>
            {notebookCount > 0 && (
              <span className="text-xs font-bold text-[#7c56bd] tabular-nums">
                · {notebookCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Center Zone: Crowned BookNote Wordmark matching mockup */}
      <div className="hidden md:flex items-center gap-2.5 shrink-0 select-none">
        <div className="relative flex items-center">
          <svg
            className="w-8 h-7 -mr-2 -mt-6 -rotate-12 drop-shadow"
            viewBox="0 0 36 30"
            fill="none"
          >
            <path
              d="M4 24L2 8L11 15L18 4L25 15L34 8L32 24H4Z"
              fill="#F8D26A"
              stroke="#3b265d"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          </svg>
          <span
            className="font-display text-4xl lg:text-[42px] font-bold tracking-tight bg-gradient-to-b from-[#64489c] via-[#7f5ab8] to-[#b57ec7] bg-clip-text text-transparent"
            style={{
              WebkitTextStroke: '2px #ffffff',
              paintOrder: 'stroke fill',
              filter: 'drop-shadow(0 4px 8px rgba(56, 30, 99, 0.35))',
            }}
          >
            BookNote
          </span>
        </div>

        {/* Open mini book emblem */}
        <svg className="w-11 h-10 drop-shadow-md -rotate-6" viewBox="0 0 56 48" fill="none">
          <path
            d="M6 10C6 10 18 7 28 13C38 7 50 10 50 10V38C50 38 38 35 28 41C18 35 6 38 6 38V10Z"
            fill="#FFFDF7"
            stroke="#362357"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="M28 13V41" stroke="#7c56bd" strokeWidth="2.5" />
          <path d="M12 18H22M12 24H22M12 30H20" stroke="#bba8db" strokeWidth="2" strokeLinecap="round" />
          <path d="M34 18H44M34 24H44M34 30H42" stroke="#bba8db" strokeWidth="2" strokeLinecap="round" />
          <path
            d="M36 4L41 2L35 18L31 19L32 14L36 4Z"
            fill="#F8D26A"
            stroke="#362357"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Right Zone: Language, Account, Sound, Star Counter */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onOpenLanguage}
          title={t.languageSettings}
          aria-label={t.languageSettings}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/90 hover:bg-white text-[#4b3575] border-2 border-white shadow-[0_4px_12px_rgba(61,35,107,0.16)] font-display font-semibold text-sm transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          <Globe className="w-4 h-4 text-[#7c56bd]" />
          <span>{currentLang.shortCode}</span>
        </button>

        <button
          type="button"
          onClick={onToggleMute}
          title={muted ? 'Unmute sounds' : 'Mute sounds'}
          aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
          className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#4b3575] border-2 border-white shadow-[0_4px_12px_rgba(61,35,107,0.16)] transition-all cursor-pointer shrink-0"
        >
          {muted ? <VolumeX className="w-4 h-4 text-[#8c7aa8]" /> : <Volume2 className="w-4 h-4 text-[#7c56bd]" />}
        </button>

        <button
          type="button"
          onClick={onOpenAuth}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/90 hover:bg-white text-[#4b3575] border-2 border-white shadow-[0_4px_12px_rgba(61,35,107,0.16)] font-display font-semibold text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 max-w-[150px]"
        >
          <User className="w-4 h-4 text-[#7c56bd] shrink-0" />
          <span className="truncate">{user ? user.displayName : t.signIn}</span>
        </button>

        <div
          className="btn-game-purple inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-white font-display font-bold text-base tabular-nums shrink-0"
          title={t.starsEarned}
        >
          <Star className="w-5 h-5 fill-[#ffd54f] text-[#5b3b12]" />
          <span>{stars}</span>
        </div>
      </div>
    </header>
  );
};
