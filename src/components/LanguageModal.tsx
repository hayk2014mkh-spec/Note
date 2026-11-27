import React from 'react';
import { Check, Globe, X } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../data/catalog';
import type { TranslationBundle } from '../i18n/translations';
import type { LanguageCode } from '../types/booknote';
import { soundFX } from '../utils/sound';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  t: TranslationBundle;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({
  isOpen,
  onClose,
  language,
  onSelectLanguage,
  t,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#22153a]/55 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-[#faf6ff] border-2 border-white rounded-3xl p-6 shadow-[0_24px_60px_rgba(34,20,62,0.45)] relative max-h-[90vh] overflow-y-auto"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-2 rounded-full text-[#6f5a91] hover:bg-[#ede4fa] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 pr-8">
          <div className="w-10 h-10 rounded-2xl bg-[#ece2fc] text-[#6845a3] flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-[#2f1f4c]">
              {t.languageSettings}
            </h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#5d4980] mt-2.5 leading-relaxed">
          {t.languageSettingsDesc}
        </p>
        <p className="text-xs font-semibold text-[#6c48ad] mt-1.5 mb-5">
          {t.utf8Note}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const active = lang.code === language;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  soundFX.playTap();
                  onSelectLanguage(lang.code);
                  onClose();
                }}
                className={`flex items-center justify-between gap-3 p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  active
                    ? 'bg-white border-[#7f58c9] shadow-[0_6px_18px_rgba(127,88,201,0.2)]'
                    : 'bg-white/75 border-white hover:bg-white hover:border-[#cbb6ef]'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-base text-[#2f1f4c]">
                      {lang.nativeName}
                    </span>
                    <span className="text-xs font-semibold text-[#7b679c]">
                      · {lang.englishName}
                    </span>
                  </div>
                  <p className="text-xs text-[#6e5a91] truncate mt-0.5">
                    {lang.sampleText}
                  </p>
                </div>

                {active && (
                  <span className="w-6 h-6 rounded-full bg-[#7f58c9] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
