import React, { useState } from 'react';
import { BookPlus, FolderOpen, Trash2 } from 'lucide-react';
import { getCoverById } from '../data/catalog';
import type { TranslationBundle } from '../i18n/translations';
import type { Notebook, UserProfile } from '../types/booknote';
import { soundFX } from '../utils/sound';

interface BookshelfViewProps {
  t: TranslationBundle;
  notebooks: Notebook[];
  user: UserProfile | null;
  onOpenNotebook: (notebook: Notebook) => void;
  onDeleteNotebook: (id: string) => void;
  onCreateNew: () => void;
  onOpenAuth: () => void;
}

export const BookshelfView: React.FC<BookshelfViewProps> = ({
  t,
  notebooks,
  user,
  onOpenNotebook,
  onDeleteNotebook,
  onCreateNew,
  onOpenAuth,
}) => {
  const [confirmId, setConfirmId] = useState<string | null>(null);

  return (
    <section className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-16">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#31214b] drop-shadow-[0_2px_6px_rgba(255,255,255,0.65)]">
            {t.savedBooksTitle}
          </h1>
          {!user && (
            <button
              type="button"
              onClick={onOpenAuth}
              className="mt-1 text-xs sm:text-sm font-semibold text-[#5b3b8c] underline decoration-dotted hover:text-[#3d2566] cursor-pointer"
            >
              {t.guestBanner}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            soundFX.playTap();
            onCreateNew();
          }}
          className="btn-game-purple inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-display font-bold text-base transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          <BookPlus className="w-4 h-4" />
          <span>{t.newBook}</span>
        </button>
      </div>

      {notebooks.length === 0 ? (
        <div className="bg-white/85 backdrop-blur-md border-2 border-white rounded-3xl p-10 text-center max-w-xl mx-auto shadow-[0_14px_34px_rgba(64,36,112,0.16)]">
          <img
            src="/assets/stickers/cosy/open_book.png"
            alt=""
            referrerPolicy="no-referrer"
            className="w-24 h-20 object-contain mx-auto mb-4 drop-shadow"
          />
          <h2 className="font-display text-2xl font-bold text-[#372456] mb-2">
            {t.emptyShelfTitle}
          </h2>
          <p className="text-sm sm:text-base text-[#614d82] mb-6 max-w-md mx-auto">
            {t.emptyShelfDesc}
          </p>
          <button
            type="button"
            onClick={() => {
              soundFX.playTap();
              onCreateNew();
            }}
            className="btn-game-purple px-7 py-3 rounded-full text-white font-display font-bold text-base cursor-pointer whitespace-nowrap"
          >
            {t.pickFirstBook}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {notebooks.map((nb) => {
            const cover = getCoverById(nb.coverId);
            const totalStickers =
              nb.coverStickers.length +
              nb.pages.reduce((sum, p) => sum + p.stickers.length, 0);
            const previewText = nb.pages.map((p) => p.content.trim()).find(Boolean) || '';

            return (
              <article
                key={nb.id}
                className="group bg-white/88 backdrop-blur-sm border-2 border-white rounded-3xl p-4 shadow-[0_12px_28px_rgba(61,35,107,0.16)] flex gap-4 items-stretch transition-transform duration-200 hover:-translate-y-1"
              >
                {/* Cover Thumbnail with Cover Stickers */}
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playPageFlip();
                    onOpenNotebook(nb);
                  }}
                  className="relative w-28 sm:w-32 shrink-0 aspect-[230/314] rounded-2xl overflow-hidden bg-[#f4effc] shadow-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7f58c9]"
                >
                  <img
                    src={cover.imageSrc}
                    alt={nb.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                  {nb.coverStickers.map((st) => (
                    <img
                      key={st.id}
                      src={st.src}
                      alt=""
                      referrerPolicy="no-referrer"
                      style={{
                        left: `${st.x}%`,
                        top: `${st.y}%`,
                        transform: `translate(-50%, -50%) rotate(${st.rotation}deg) scale(${st.scale * 0.45})`,
                        zIndex: st.zIndex,
                      }}
                      className="pointer-events-none absolute w-14 h-14 object-contain drop-shadow"
                    />
                  ))}
                </button>

                {/* Book Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                  <div>
                    <h2 className="font-display text-lg font-bold text-[#32214f] truncate" title={nb.title}>
                      {nb.title}
                    </h2>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[#6f5a91] mt-1 tabular-nums">
                      <span>{nb.pages.length} {t.pagesCount}</span>
                      <span aria-hidden="true">·</span>
                      <span>{totalStickers} {t.stickersCount}</span>
                    </div>
                    <p className="mt-2.5 text-xs sm:text-sm text-[#4f3d6e] line-clamp-3 leading-relaxed">
                      {previewText || t.writePlaceholder}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2 pt-2 border-t border-[#ece3fa]">
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playPageFlip();
                        onOpenNotebook(nb);
                      }}
                      className="btn-game-purple inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-white font-display font-semibold text-sm cursor-pointer whitespace-nowrap"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>{t.openBook}</span>
                    </button>

                    {confirmId === nb.id ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            soundFX.playTap();
                            onDeleteNotebook(nb.id);
                            setConfirmId(null);
                          }}
                          className="px-2.5 py-1 rounded-full bg-[#d6456b] text-white text-xs font-bold cursor-pointer whitespace-nowrap"
                        >
                          {t.deleteBook}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmId(null)}
                          className="px-2 py-1 rounded-full bg-[#efe8fb] text-[#4b3575] text-xs font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmId(nb.id)}
                        aria-label={t.deleteBook}
                        title={t.deleteBook}
                        className="p-2 rounded-full text-[#8b76ad] hover:text-[#c93b63] hover:bg-[#fdebf0] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
