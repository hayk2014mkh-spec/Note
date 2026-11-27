import React from 'react';

interface DeskAtmosphereProps {
  goodNotesText: string;
  writeIdeasText: string;
  compact?: boolean;
}

export const DeskAtmosphere: React.FC<DeskAtmosphereProps> = ({
  goodNotesText,
  writeIdeasText,
  compact = false,
}) => {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden select-none z-0" aria-hidden="true">
      {/* Soft top-to-bottom ambient glow matching the purple desk room */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 35%, rgba(255,255,255,0.28) 0%, rgba(182,155,222,0.18) 55%, rgba(122,95,168,0.34) 100%)',
        }}
      />

      {/* Hanging cozy leaf vines top-left */}
      <svg
        className="hidden md:block absolute -top-2 left-10 w-40 h-52 opacity-65 text-[#496350]"
        viewBox="0 0 160 210"
        fill="none"
      >
        <path d="M30 0 C32 60, 20 110, 28 180" stroke="#3d5243" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M85 0 C82 50, 96 95, 86 155" stroke="#3d5243" strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="18" cy="48" rx="13" ry="7" transform="rotate(-25 18 48)" fill="currentColor" />
        <ellipse cx="42" cy="76" rx="13" ry="7" transform="rotate(22 42 76)" fill="currentColor" />
        <ellipse cx="15" cy="112" rx="12" ry="7" transform="rotate(-18 15 112)" fill="currentColor" />
        <ellipse cx="40" cy="146" rx="11" ry="6" transform="rotate(20 40 146)" fill="currentColor" />
        <ellipse cx="72" cy="42" rx="13" ry="7" transform="rotate(-20 72 42)" fill="#5c7863" />
        <ellipse cx="98" cy="74" rx="12" ry="7" transform="rotate(25 98 74)" fill="#5c7863" />
        <ellipse cx="74" cy="110" rx="11" ry="6" transform="rotate(-15 74 110)" fill="#5c7863" />
      </svg>

      {/* Cozy "Good Notes!" pinned memo on left */}
      {!compact && (
        <div className="hidden lg:flex flex-col items-center justify-center absolute top-40 left-6 w-28 h-28 bg-[#f4e4d3] border-2 border-[#7b5d47]/40 rounded-md shadow-md -rotate-6 p-2 text-center">
          <span className="w-2.5 h-2.5 rounded-full bg-[#926cc7] border border-white mb-1 shadow-sm" />
          <p className="font-hand text-xl font-bold leading-tight text-[#4c3752]">
            {goodNotesText}
          </p>
        </div>
      )}

      {/* Subtle sparkle stars */}
      <div className="hidden sm:block absolute top-28 left-1/4 text-[#fff7d6] opacity-80 text-2xl">✦</div>
      <div className="hidden sm:block absolute top-20 right-1/4 text-[#fff7d6] opacity-75 text-xl">✦</div>
      <div className="hidden md:block absolute bottom-32 left-1/3 text-[#fff7d6] opacity-60 text-lg">★</div>

      {/* Sleeping black cat with purple headphones on stacked books (extracted from user's design) */}
      <img
        src="/assets/covers/sleeping_cat.png"
        alt=""
        referrerPolicy="no-referrer"
        className={`hidden md:block absolute bottom-0 left-0 object-contain drop-shadow-[0_10px_22px_rgba(48,26,84,0.35)] transition-opacity duration-200 ${
          compact ? 'w-56 opacity-75' : 'w-72 lg:w-80 opacity-95'
        }`}
      />

      {/* "Write Your Ideas..." pinned note & purple pencil at bottom-right */}
      {!compact && (
        <div className="hidden lg:flex items-end gap-2 absolute bottom-5 right-7">
          <div className="relative bg-[#f5e1cf] border-2 border-[#7c5d4c]/45 rounded-lg shadow-lg px-4 py-4 w-44 rotate-3">
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-3 rounded-sm bg-[#9b80c4] border border-white/80 shadow" />
            <p className="font-hand text-2xl font-bold text-[#49324e] leading-snug text-center">
              {writeIdeasText}
            </p>
            <span className="block text-center text-[#d87093] text-sm mt-1">♥</span>
          </div>
          <div className="w-4 h-24 rounded-full bg-gradient-to-b from-[#9c78d4] to-[#6845a3] border-2 border-[#3a255e] rotate-12 shadow-md relative -ml-3 mb-1">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[12px] border-l-transparent border-r-transparent border-b-[#f2d3b3]" />
          </div>
        </div>
      )}
    </div>
  );
};
