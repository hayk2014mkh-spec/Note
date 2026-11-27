export type LanguageCode = 'en' | 'hy' | 'ru' | 'hi' | 'es' | 'fr' | 'ja' | 'ko';

export type CoverStyleId =
  | 'star-xo'
  | 'love-pop'
  | 'kuromi-plaid'
  | 'music-grid'
  | 'kawaii-pink'
  | 'travel-scrapbook';

export type PaperStyleId = 'lined' | 'dotted' | 'grid' | 'lavender' | 'blush';
export type NoteFontId = 'body' | 'hand' | 'editorial' | 'mono';
export type StickerPackId = 'indie' | 'kawaii' | 'cosy' | 'pop';

export interface NotebookCoverStyle {
  id: CoverStyleId;
  imageSrc: string;
  accentColor: string;
  defaultPaper: PaperStyleId;
  ringColor: string;
}

export interface StickerAsset {
  id: string;
  pack: StickerPackId;
  src: string;
  label: string;
}

export interface PlacedSticker {
  id: string;
  stickerId: string;
  src: string;
  x: number; // percentage 0..100
  y: number; // percentage 0..100
  scale: number; // 0.4..2.5
  rotation: number; // -180..180
  zIndex: number;
}

export interface NotebookPage {
  id: string;
  title: string;
  content: string;
  inkColor: string;
  fontStyle: NoteFontId;
  fontSize: number;
  stickers: PlacedSticker[];
}

export interface Notebook {
  id: string;
  userId: string;
  title: string;
  coverId: CoverStyleId;
  paperStyle: PaperStyleId;
  coverStickers: PlacedSticker[];
  pages: NotebookPage[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  language: LanguageCode;
  stars: number;
  createdAt: string;
}

export type AppScreen = 'picker' | 'shelf' | 'studio';
