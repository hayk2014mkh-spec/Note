import React, { useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  PenLine,
  Plus,
  Save,
  Sparkles,
} from 'lucide-react';
import {
  getCoverById,
  INK_COLORS,
  NOTE_FONTS,
  PAPER_STYLES,
  STICKER_ASSETS,
  STICKER_PACKS,
} from '../data/catalog';
import type { TranslationBundle } from '../i18n/translations';
import type {
  Notebook,
  NotebookPage,
  NoteFontId,
  PaperStyleId,
  PlacedSticker,
  StickerAsset,
  StickerPackId,
  UserProfile,
} from '../types/booknote';
import { soundFX } from '../utils/sound';
import { StickerLayer } from './StickerLayer';

interface NotebookStudioProps {
  notebook: Notebook;
  onChangeNotebook: (updated: Notebook) => void;
  onManualSave: () => void;
  saveStatus: 'saved' | 'saving' | 'dirty';
  user: UserProfile | null;
  onOpenAuth: () => void;
  t: TranslationBundle;
}

export const NotebookStudio: React.FC<NotebookStudioProps> = ({
  notebook,
  onChangeNotebook,
  onManualSave,
  saveStatus,
  user,
  onOpenAuth,
  t,
}) => {
  const [studioMode, setStudioMode] = useState<'write' | 'cover'>('write');
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [activePack, setActivePack] = useState<StickerPackId>('indie');
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

  const safeIndex = Math.min(activePageIndex, Math.max(0, notebook.pages.length - 1));
  const currentPage: NotebookPage = notebook.pages[safeIndex] || {
    id: 'default-page',
    title: '',
    content: '',
    inkColor: '#2c2142',
    fontStyle: 'body',
    fontSize: 17,
    stickers: [],
  };

  const coverStyle = getCoverById(notebook.coverId);
  const paperMeta = PAPER_STYLES.find((p) => p.id === notebook.paperStyle) || PAPER_STYLES[0];
  const fontMeta = NOTE_FONTS.find((f) => f.id === currentPage.fontStyle) || NOTE_FONTS[0];
  const packStickers = STICKER_ASSETS.filter((s) => s.pack === activePack);

  const updateCurrentPage = (patch: Partial<NotebookPage>) => {
    const nextPages = notebook.pages.map((pg, idx) =>
      idx === safeIndex ? { ...pg, ...patch } : pg
    );
    onChangeNotebook({ ...notebook, pages: nextPages });
  };

  const handleAddPage = () => {
    soundFX.playPageFlip();
    const newPage: NotebookPage = {
      id: crypto.randomUUID ? crypto.randomUUID() : `pg-${Date.now()}`,
      title: '',
      content: '',
      inkColor: currentPage.inkColor,
      fontStyle: currentPage.fontStyle,
      fontSize: currentPage.fontSize,
      stickers: [],
    };
    const nextPages = [...notebook.pages, newPage];
    onChangeNotebook({ ...notebook, pages: nextPages });
    setActivePageIndex(nextPages.length - 1);
    setSelectedStickerId(null);
  };

  const handlePlaceSticker = (asset: StickerAsset) => {
    soundFX.playStickerPop();
    const newId = crypto.randomUUID ? crypto.randomUUID() : `st-${Date.now()}-${Math.random()}`;
    const existingList =
      studioMode === 'cover' ? notebook.coverStickers : currentPage.stickers;
    const maxZ = existingList.reduce((m, s) => Math.max(m, s.zIndex), 0);

    const newSticker: PlacedSticker = {
      id: newId,
      stickerId: asset.id,
      src: asset.src,
      x: 28 + Math.round(Math.random() * 44),
      y: 25 + Math.round(Math.random() * 48),
      scale: 1,
      rotation: Math.round((Math.random() - 0.5) * 18),
      zIndex: maxZ + 1,
    };

    if (studioMode === 'cover') {
      onChangeNotebook({
        ...notebook,
        coverStickers: [...notebook.coverStickers, newSticker],
      });
    } else {
      updateCurrentPage({
        stickers: [...currentPage.stickers, newSticker],
      });
    }
    setSelectedStickerId(newId);
  };

  const handleUpdateSticker = (id: string, patch: Partial<PlacedSticker>) => {
    if (studioMode === 'cover') {
      onChangeNotebook({
        ...notebook,
        coverStickers: notebook.coverStickers.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      });
    } else {
      updateCurrentPage({
        stickers: currentPage.stickers.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      });
    }
  };

  const handleDeleteSticker = (id: string) => {
    if (studioMode === 'cover') {
      onChangeNotebook({
        ...notebook,
        coverStickers: notebook.coverStickers.filter((s) => s.id !== id),
      });
    } else {
      updateCurrentPage({
        stickers: currentPage.stickers.filter((s) => s.id !== id),
      });
    }
  };

  return (
    <section className="relative z-10 w-full max-w-7xl mx-auto px-3 sm:px-6 pt-2 pb-10">
      {/* Studio Header Bar: Editable Book Title, Mode Tabs, Save Controls */}
      <div className="bg-white/85 backdrop-blur-md border-2 border-white rounded-3xl px-4 py-3 mb-4 shadow-[0_10px_24px_rgba(61,35,107,0.14)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
          <img
            src={coverStyle.imageSrc}
            alt=""
            referrerPolicy="no-referrer"
            className="w-9 h-12 object-contain rounded-md shadow-sm shrink-0"
          />
          <input
            type="text"
            value={notebook.title}
            onChange={(e) => onChangeNotebook({ ...notebook, title: e.target.value })}
            maxLength={120}
            aria-label={t.notebookTitleLabel}
            className="w-full max-w-xs px-3 py-1.5 rounded-xl bg-[#f7f2ff] border border-[#e3d7f9] focus:border-[#7f58c9] focus:outline-none font-display font-bold text-base sm:text-lg text-[#2e1e4b]"
          />
        </div>

        {/* Mode Switcher: Write Notes vs Cover Stickers */}
        <div className="flex items-center gap-1 p-1 rounded-full bg-[#efe8fc] border border-[#e1d4f7]">
          <button
            type="button"
            onClick={() => {
              soundFX.playTap();
              setStudioMode('write');
              setSelectedStickerId(null);
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-display font-semibold transition-all cursor-pointer whitespace-nowrap ${
              studioMode === 'write'
                ? 'bg-[#7b55c4] text-white shadow-sm'
                : 'text-[#4f3a75] hover:text-[#2e1e4b]'
            }`}
          >
            <PenLine className="w-3.5 h-3.5" />
            <span>{t.writeInsideTab}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFX.playTap();
              setStudioMode('cover');
              setSelectedStickerId(null);
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-display font-semibold transition-all cursor-pointer whitespace-nowrap ${
              studioMode === 'cover'
                ? 'bg-[#7b55c4] text-white shadow-sm'
                : 'text-[#4f3a75] hover:text-[#2e1e4b]'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{t.decorateCoverTab}</span>
          </button>
        </div>

        {/* Save Status & Save Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          {!user && (
            <button
              type="button"
              onClick={onOpenAuth}
              className="hidden sm:inline-flex text-xs font-semibold text-[#6543a1] underline decoration-dotted hover:text-[#3d2566] cursor-pointer"
            >
              {t.signIn}
            </button>
          )}
          <span className="text-xs font-semibold text-[#6e5a91] inline-flex items-center gap-1 whitespace-nowrap">
            {saveStatus === 'saving' ? (
              <span>{t.saving}</span>
            ) : (
              <>
                <Check className="w-3.5 h-3.5 text-[#3e8e68]" />
                <span>{user ? t.savedAccount : t.savedGuest}</span>
              </>
            )}
          </span>
          <button
            type="button"
            onClick={() => {
              soundFX.playTap();
              onManualSave();
            }}
            className="btn-game-purple inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-white font-display font-semibold text-sm cursor-pointer whitespace-nowrap"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{t.saveNow}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Grid: Notebook Canvas (left) + Sticker Sheets Drawer (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left/Center: Interactive Spiral Notebook */}
        <div className="lg:col-span-8 flex flex-col">
          {studioMode === 'write' ? (
            <div className="bg-white/90 rounded-[28px] border-2 border-white shadow-[0_18px_40px_rgba(52,30,96,0.22)] overflow-hidden">
              {/* Paper, Ink, Font & Page Toolbar */}
              <div className="px-4 py-2.5 bg-[#f5efff] border-b border-[#e5d9fa] flex flex-wrap items-center justify-between gap-3">
                {/* Paper & Ink Controls */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#5e4982]">{t.paperLabel}:</span>
                    {PAPER_STYLES.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        title={t.papers[p.id as PaperStyleId]}
                        onClick={() => {
                          soundFX.playTap();
                          onChangeNotebook({ ...notebook, paperStyle: p.id });
                        }}
                        style={{ backgroundColor: p.swatch }}
                        className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                          notebook.paperStyle === p.id
                            ? 'border-[#6c48ad] scale-110 shadow'
                            : 'border-[#d3c2f0]'
                        }`}
                      />
                    ))}
                  </div>

                  <span className="hidden sm:inline-block w-px h-5 bg-[#dcccf6]" />

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#5e4982]">{t.inkLabel}:</span>
                    {INK_COLORS.map((ink) => (
                      <button
                        key={ink.id}
                        type="button"
                        title={ink.name}
                        onClick={() => {
                          soundFX.playTap();
                          updateCurrentPage({ inkColor: ink.hex });
                        }}
                        style={{ backgroundColor: ink.hex }}
                        className={`w-5 h-5 rounded-full border-2 transition-transform cursor-pointer ${
                          currentPage.inkColor === ink.hex
                            ? 'border-white ring-2 ring-[#7b55c4] scale-110'
                            : 'border-white/70'
                        }`}
                      />
                    ))}
                  </div>

                  <span className="hidden sm:inline-block w-px h-5 bg-[#dcccf6]" />

                  {/* Font Selector */}
                  <select
                    aria-label={t.fontLabel}
                    value={currentPage.fontStyle}
                    onChange={(e) => {
                      soundFX.playTap();
                      updateCurrentPage({ fontStyle: e.target.value as NoteFontId });
                    }}
                    className="px-2.5 py-1 rounded-xl bg-white border border-[#dfd1f7] text-xs font-semibold text-[#3c295c] focus:outline-none focus:border-[#7b55c4] cursor-pointer"
                  >
                    {NOTE_FONTS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {t.fonts[f.id]}
                      </option>
                    ))}
                  </select>

                  {/* Font Size Controls */}
                  <div className="flex items-center gap-1 bg-white rounded-xl border border-[#dfd1f7] px-1.5 py-0.5">
                    <button
                      type="button"
                      onClick={() =>
                        updateCurrentPage({ fontSize: Math.max(13, currentPage.fontSize - 1) })
                      }
                      className="px-1.5 text-xs font-bold text-[#563c85] hover:text-[#2e1e4b] cursor-pointer"
                    >
                      A-
                    </button>
                    <span className="text-xs font-bold text-[#6f5a91] tabular-nums w-6 text-center">
                      {currentPage.fontSize}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateCurrentPage({ fontSize: Math.min(26, currentPage.fontSize + 1) })
                      }
                      className="px-1.5 text-xs font-bold text-[#563c85] hover:text-[#2e1e4b] cursor-pointer"
                    >
                      A+
                    </button>
                  </div>
                </div>

                {/* Page Navigation */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={safeIndex === 0}
                    onClick={() => {
                      soundFX.playPageFlip();
                      setActivePageIndex((i) => Math.max(0, i - 1));
                      setSelectedStickerId(null);
                    }}
                    aria-label="Previous page"
                    className="p-1.5 rounded-full bg-white border border-[#dfd1f7] text-[#4b3575] disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="text-xs font-bold text-[#4b3575] px-1.5 tabular-nums whitespace-nowrap">
                    {t.pageLabel} {safeIndex + 1} / {notebook.pages.length}
                  </span>

                  <button
                    type="button"
                    disabled={safeIndex >= notebook.pages.length - 1}
                    onClick={() => {
                      soundFX.playPageFlip();
                      setActivePageIndex((i) => Math.min(notebook.pages.length - 1, i + 1));
                      setSelectedStickerId(null);
                    }}
                    aria-label="Next page"
                    className="p-1.5 rounded-full bg-white border border-[#dfd1f7] text-[#4b3575] disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleAddPage}
                    className="ml-1 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#7b55c4] hover:bg-[#6a44b3] text-white text-xs font-display font-semibold cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t.addPage}</span>
                  </button>
                </div>
              </div>

              {/* Open Spiral Page Body */}
              <div className="relative flex min-h-[500px] sm:min-h-[560px]">
                {/* Realistic Spiral Spine Rings */}
                <div
                  className="w-10 sm:w-12 shrink-0 bg-gradient-to-r from-[#e5daf7] to-[#f4eeff] border-r border-[#dfd2f5] flex flex-col items-center justify-evenly py-5 select-none"
                  aria-hidden="true"
                >
                  {Array.from({ length: 11 }).map((_, idx) => (
                    <div key={idx} className="relative flex items-center w-full justify-center">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#6d5894]/25 border border-[#6d5894]/35" />
                      <span
                        className="absolute -left-1 w-7 h-2 rounded-full border border-[#4a376e]/40 shadow-sm"
                        style={{ backgroundColor: coverStyle.ringColor }}
                      />
                    </div>
                  ))}
                </div>

                {/* Writing Surface + Interactive Stickers */}
                <div className={`relative flex-1 ${paperMeta.className} p-5 sm:p-8 flex flex-col`}>
                  <input
                    type="text"
                    value={currentPage.title}
                    onChange={(e) => updateCurrentPage({ title: e.target.value })}
                    maxLength={120}
                    placeholder={t.pageTitlePlaceholder}
                    style={{ color: currentPage.inkColor }}
                    className={`relative z-10 w-full bg-transparent border-b-2 border-[#d9c8f4]/70 pb-2 mb-4 focus:outline-none focus:border-[#7b55c4] font-bold text-xl sm:text-2xl placeholder:text-[#9c8ab8] ${fontMeta.className}`}
                  />

                  <textarea
                    value={currentPage.content}
                    onChange={(e) => updateCurrentPage({ content: e.target.value })}
                    placeholder={t.writePlaceholder}
                    style={{
                      color: currentPage.inkColor,
                      fontSize: `${currentPage.fontSize}px`,
                      lineHeight: '32px',
                    }}
                    className={`relative z-10 flex-1 w-full min-h-[400px] bg-transparent resize-none focus:outline-none placeholder:text-[#9f8ebb] ${fontMeta.className}`}
                  />

                  {/* Stickers placed on this page */}
                  <StickerLayer
                    stickers={currentPage.stickers}
                    selectedStickerId={selectedStickerId}
                    onSelectSticker={setSelectedStickerId}
                    onUpdateSticker={handleUpdateSticker}
                    onDeleteSticker={handleDeleteSticker}
                    t={t}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Decorate Cover Mode */
            <div className="bg-white/85 backdrop-blur-md rounded-[28px] border-2 border-white shadow-[0_18px_40px_rgba(52,30,96,0.22)] p-6 sm:p-8 flex flex-col items-center justify-center min-h-[560px]">
              <p className="text-xs sm:text-sm font-semibold text-[#5b4580] mb-4 text-center">
                {t.coverTip}
              </p>

              <div className="relative w-full max-w-[330px] aspect-[230/314] rounded-2xl overflow-hidden shadow-[0_20px_44px_rgba(48,26,84,0.3)] bg-[#f4effc]">
                <img
                  src={coverStyle.imageSrc}
                  alt={notebook.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain select-none"
                />
                <StickerLayer
                  stickers={notebook.coverStickers}
                  selectedStickerId={selectedStickerId}
                  onSelectSticker={setSelectedStickerId}
                  onUpdateSticker={handleUpdateSticker}
                  onDeleteSticker={handleDeleteSticker}
                  t={t}
                  baseWidthPx={76}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: User's 4 Sticker Sheets Drawer */}
        <aside className="lg:col-span-4 bg-white/88 backdrop-blur-md rounded-[28px] border-2 border-white shadow-[0_14px_34px_rgba(52,30,96,0.18)] p-4 flex flex-col">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="font-display text-lg font-bold text-[#332150] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#7b55c4]" />
              <span>{t.stickerTrayTitle}</span>
            </h2>
          </div>

          <p className="text-xs text-[#614d82] mb-3 leading-relaxed">
            {studioMode === 'cover' ? t.coverTip : t.stickerTip}
          </p>

          {/* 4 Sticker Pack Tabs */}
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {STICKER_PACKS.map((pack) => {
              const active = activePack === pack.id;
              return (
                <button
                  key={pack.id}
                  type="button"
                  onClick={() => {
                    soundFX.playTap();
                    setActivePack(pack.id);
                  }}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-2xl border text-left transition-all cursor-pointer ${
                    active
                      ? 'bg-[#7b55c4] text-white border-[#6741b0] shadow-sm'
                      : 'bg-[#f6f1ff] text-[#453069] border-[#e6daf9] hover:bg-[#ede3fd]'
                  }`}
                >
                  <img
                    src={pack.previewSrc}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 object-contain shrink-0 drop-shadow-sm"
                  />
                  <span className="text-xs font-display font-semibold truncate">
                    {t.packs[pack.id]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Stickers Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-2.5 max-h-[410px] overflow-y-auto pr-1 pt-1">
            {packStickers.map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => handlePlaceSticker(asset)}
                title={asset.label}
                className="group aspect-square rounded-2xl bg-[#fbf8ff] hover:bg-white border border-[#eadffc] hover:border-[#9e7ee0] p-2 flex items-center justify-center transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
              >
                <img
                  src={asset.src}
                  alt={asset.label}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain drop-shadow-sm transition-transform duration-150 group-hover:scale-110"
                />
              </button>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
};
