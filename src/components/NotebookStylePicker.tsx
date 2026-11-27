import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { NOTEBOOK_COVERS } from '../data/catalog';
import type { TranslationBundle } from '../i18n/translations';
import type { CoverStyleId } from '../types/booknote';
import { soundFX } from '../utils/sound';

interface NotebookStylePickerProps {
  t: TranslationBundle;
  onSelectStyle: (coverId: CoverStyleId, title: string) => void;
  isBusy?: boolean;
}

export const NotebookStylePicker: React.FC<NotebookStylePickerProps> = ({
  t,
  onSelectStyle,
  isBusy = false,
}) => {
  const [selectedCover, setSelectedCover] = useState<CoverStyleId>('star-xo');
  const [customTitle, setCustomTitle] = useState('');

  const handleChoose = (id: CoverStyleId) => {
    soundFX.playTap();
    setSelectedCover(id);
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBusy) return;
    soundFX.playStarChime();
    const fallbackTitle = t.covers[selectedCover];
    onSelectStyle(selectedCover, customTitle.trim() || fallbackTitle);
  };

  return (
    <section className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-3 pb-10 flex flex-col items-center">
      {/* Mobile BookNote Title */}
      <h1 className="md:hidden font-display text-3xl font-bold text-white drop-shadow-[0_3px_8px_rgba(64,34,112,0.45)] mb-2">
        BookNote
      </h1>

      {/* Heading matching mockup: "Choose your notebook style:" */}
      <h2
        className="font-display text-xl sm:text-2xl md:text-[26px] font-bold text-[#34234e] text-center mb-6 px-4 py-1.5 rounded-full bg-white/55 backdrop-blur-sm border border-white/70 shadow-sm"
      >
        {t.chooseStyleTitle}
      </h2>

      {/* 6 Notebook Styles Grid — matching user's exact 6 spiral designs */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5 items-center justify-items-center mb-7">
        {NOTEBOOK_COVERS.map((cover) => {
          const isSelected = selectedCover === cover.id;
          return (
            <button
              key={cover.id}
              type="button"
              onClick={() => handleChoose(cover.id)}
              aria-pressed={isSelected}
              className={`group relative flex flex-col items-center rounded-2xl p-2 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white ${
                isSelected
                  ? 'bg-white/90 shadow-[0_0_28px_rgba(255,255,255,0.95),0_12px_24px_rgba(69,40,118,0.28)] scale-[1.04] ring-4 ring-white'
                  : 'bg-white/35 hover:bg-white/65 shadow-[0_8px_20px_rgba(69,40,118,0.18)] hover:-translate-y-1'
              }`}
            >
              {/* Checkmark Badge on top-right when selected */}
              {isSelected && (
                <span className="absolute -top-2.5 -right-2.5 z-10 w-8 h-8 rounded-full bg-[#8a65cf] border-[2.5px] border-white text-white flex items-center justify-center shadow-md">
                  <Check className="w-4 h-4 stroke-[3]" />
                </span>
              )}

              <div className="w-full aspect-[230/314] rounded-xl overflow-hidden bg-[#2b203f]/10 flex items-center justify-center">
                <img
                  src={cover.imageSrc}
                  alt={t.covers[cover.id]}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-[1.02]"
                />
              </div>

              <span className="mt-2 text-xs sm:text-sm font-display font-semibold text-[#3c295c] text-center leading-tight line-clamp-1">
                {t.covers[cover.id]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Custom Title Input (UTF-8 ready) + Select Button */}
      <form onSubmit={handleConfirm} className="w-full max-w-md flex flex-col items-center gap-4">
        <div className="w-full">
          <label
            htmlFor="new-notebook-title"
            className="block text-xs font-bold text-[#463069] mb-1.5 text-center"
          >
            {t.notebookTitleLabel}
          </label>
          <input
            id="new-notebook-title"
            type="text"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            maxLength={120}
            placeholder={t.notebookTitlePlaceholder}
            className="w-full px-4 py-2.5 rounded-2xl bg-white/92 border-2 border-white focus:border-[#7f58c9] focus:outline-none text-[#2c2142] placeholder:text-[#8f7da8] font-medium text-sm sm:text-base shadow-[0_6px_16px_rgba(69,40,118,0.14)] text-center"
          />
        </div>

        <button
          type="submit"
          disabled={isBusy}
          className="btn-game-purple min-w-[210px] px-8 py-3 rounded-full text-white font-display font-bold text-xl tracking-wide transition-all cursor-pointer disabled:opacity-60 inline-flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <span className="text-[#ffe27a] text-sm">✦</span>
          <span>{isBusy ? t.creating : t.selectBtn}</span>
          <span className="text-[#ffe27a] text-sm">✦</span>
        </button>
      </form>
    </section>
  );
};
