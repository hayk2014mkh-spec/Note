import React, { useRef, useState } from 'react';
import { RotateCcw, RotateCw, Trash2, ZoomIn, ZoomOut } from 'lucide-react';
import type { TranslationBundle } from '../i18n/translations';
import type { PlacedSticker } from '../types/booknote';
import { soundFX } from '../utils/sound';

interface StickerLayerProps {
  stickers: PlacedSticker[];
  selectedStickerId: string | null;
  onSelectSticker: (id: string | null) => void;
  onUpdateSticker: (id: string, patch: Partial<PlacedSticker>) => void;
  onDeleteSticker: (id: string) => void;
  t: TranslationBundle;
  baseWidthPx?: number;
}

export const StickerLayer: React.FC<StickerLayerProps> = ({
  stickers,
  selectedStickerId,
  onSelectSticker,
  onUpdateSticker,
  onDeleteSticker,
  t,
  baseWidthPx = 82,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handlePointerDown = (e: React.PointerEvent, sticker: PlacedSticker) => {
    e.stopPropagation();
    onSelectSticker(sticker.id);

    const container = containerRef.current;
    if (!container) return;

    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    setDraggingId(sticker.id);

    const rect = container.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = sticker.x;
    const origY = sticker.y;

    const onMove = (moveEvent: PointerEvent) => {
      const dxPct = ((moveEvent.clientX - startX) / rect.width) * 100;
      const dyPct = ((moveEvent.clientY - startY) / rect.height) * 100;
      const nextX = Math.max(4, Math.min(96, origX + dxPct));
      const nextY = Math.max(4, Math.min(96, origY + dyPct));
      onUpdateSticker(sticker.id, { x: nextX, y: nextY });
    };

    const onUp = () => {
      setDraggingId(null);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  const selectedSticker = stickers.find((s) => s.id === selectedStickerId) || null;

  return (
    <div
      ref={containerRef}
      onClick={() => onSelectSticker(null)}
      className="pointer-events-none absolute inset-0 overflow-hidden z-20"
    >
      {stickers.map((st) => {
        const isSelected = st.id === selectedStickerId;
        const isDragging = st.id === draggingId;
        return (
          <div
            key={st.id}
            onPointerDown={(e) => handlePointerDown(e, st)}
            onClick={(e) => e.stopPropagation()}
            style={{
              left: `${st.x}%`,
              top: `${st.y}%`,
              width: `${baseWidthPx}px`,
              height: `${baseWidthPx}px`,
              transform: `translate(-50%, -50%) rotate(${st.rotation}deg) scale(${st.scale})`,
              zIndex: st.zIndex,
              touchAction: 'none',
            }}
            className={`pointer-events-auto absolute select-none cursor-grab active:cursor-grabbing transition-shadow ${
              isSelected
                ? 'ring-2 ring-[#7f58c9] ring-offset-2 ring-offset-transparent rounded-xl bg-white/15'
                : ''
            } ${isDragging ? 'opacity-90' : ''}`}
          >
            <img
              src={st.src}
              alt=""
              draggable={false}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain drop-shadow-[0_4px_8px_rgba(45,25,75,0.28)]"
            />
          </div>
        );
      })}

      {/* Floating Sticker Adjustment Toolbar */}
      {selectedSticker && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-auto absolute bottom-3 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#362457]/95 text-white shadow-xl border border-white/25 backdrop-blur-sm"
        >
          <button
            type="button"
            title={`${t.stickerScale} -`}
            onClick={() => {
              soundFX.playTap();
              onUpdateSticker(selectedSticker.id, {
                scale: Math.max(0.45, Number((selectedSticker.scale - 0.15).toFixed(2))),
              });
            }}
            className="p-1.5 rounded-full hover:bg-white/15 transition-colors cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            title={`${t.stickerScale} +`}
            onClick={() => {
              soundFX.playTap();
              onUpdateSticker(selectedSticker.id, {
                scale: Math.min(2.2, Number((selectedSticker.scale + 0.15).toFixed(2))),
              });
            }}
            className="p-1.5 rounded-full hover:bg-white/15 transition-colors cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <span className="w-px h-4 bg-white/25 mx-0.5" />

          <button
            type="button"
            title={`${t.stickerRotate} -15°`}
            onClick={() => {
              soundFX.playTap();
              onUpdateSticker(selectedSticker.id, {
                rotation: selectedSticker.rotation - 15,
              });
            }}
            className="p-1.5 rounded-full hover:bg-white/15 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            title={`${t.stickerRotate} +15°`}
            onClick={() => {
              soundFX.playTap();
              onUpdateSticker(selectedSticker.id, {
                rotation: selectedSticker.rotation + 15,
              });
            }}
            className="p-1.5 rounded-full hover:bg-white/15 transition-colors cursor-pointer"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <span className="w-px h-4 bg-white/25 mx-0.5" />

          <button
            type="button"
            title={t.stickerRemove}
            onClick={() => {
              soundFX.playTap();
              onDeleteSticker(selectedSticker.id);
              onSelectSticker(null);
            }}
            className="p-1.5 rounded-full bg-[#d6456b] hover:bg-[#e1557a] transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
