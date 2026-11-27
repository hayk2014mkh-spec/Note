import type {
  CoverStyleId,
  LanguageCode,
  NotebookCoverStyle,
  NoteFontId,
  PaperStyleId,
  StickerAsset,
  StickerPackId,
} from '../types/booknote';

export const NOTEBOOK_COVERS: NotebookCoverStyle[] = [
  {
    id: 'star-xo',
    imageSrc: '/assets/covers/cover_1_star_xo.png',
    accentColor: '#3d3054',
    defaultPaper: 'lavender',
    ringColor: '#d9c59a',
  },
  {
    id: 'love-pop',
    imageSrc: '/assets/covers/cover_2_love_pop.png',
    accentColor: '#d94862',
    defaultPaper: 'grid',
    ringColor: '#b7aebd',
  },
  {
    id: 'kuromi-plaid',
    imageSrc: '/assets/covers/cover_3_kuromi.png',
    accentColor: '#8d5bc2',
    defaultPaper: 'lavender',
    ringColor: '#b79cd8',
  },
  {
    id: 'music-grid',
    imageSrc: '/assets/covers/cover_4_music.png',
    accentColor: '#6d4fb8',
    defaultPaper: 'dotted',
    ringColor: '#a69fb5',
  },
  {
    id: 'kawaii-pink',
    imageSrc: '/assets/covers/cover_5_kawaii_pink.png',
    accentColor: '#d96f9d',
    defaultPaper: 'blush',
    ringColor: '#d8b4c4',
  },
  {
    id: 'travel-scrapbook',
    imageSrc: '/assets/covers/cover_6_travel.png',
    accentColor: '#8f6b4e',
    defaultPaper: 'lined',
    ringColor: '#c9b398',
  },
];

export const STICKER_PACKS: { id: StickerPackId; previewSrc: string }[] = [
  { id: 'indie', previewSrc: '/assets/stickers/indie/cat_headphones.png' },
  { id: 'kawaii', previewSrc: '/assets/stickers/kawaii/donut.png' },
  { id: 'cosy', previewSrc: '/assets/stickers/cosy/blue_cat.png' },
  { id: 'pop', previewSrc: '/assets/stickers/pop/rubiks.png' },
];

export const STICKER_ASSETS: StickerAsset[] = [
  // Pack 1: Indie & Music (image_dd21db75.png)
  { id: 'indie-cat-headphones', pack: 'indie', src: '/assets/stickers/indie/cat_headphones.png', label: 'Headphones Cat' },
  { id: 'indie-black-cat', pack: 'indie', src: '/assets/stickers/indie/black_cat.png', label: 'Black Kitty' },
  { id: 'indie-heart-cd', pack: 'indie', src: '/assets/stickers/indie/heart_cd.png', label: 'Heart CD' },
  { id: 'indie-playlist', pack: 'indie', src: '/assets/stickers/indie/playlist.png', label: 'Playlist' },
  { id: 'indie-memories', pack: 'indie', src: '/assets/stickers/indie/memories.png', label: 'Memories Ticket' },
  { id: 'indie-cinema', pack: 'indie', src: '/assets/stickers/indie/cinema.png', label: 'Cinema Ticket' },
  { id: 'indie-converse', pack: 'indie', src: '/assets/stickers/indie/converse.png', label: 'All Star Patch' },
  { id: 'indie-spider-heart', pack: 'indie', src: '/assets/stickers/indie/spider_heart.png', label: 'Spider Heart' },
  { id: 'indie-cherries', pack: 'indie', src: '/assets/stickers/indie/cherries.png', label: 'Cherries' },
  { id: 'indie-eightball', pack: 'indie', src: '/assets/stickers/indie/eightball.png', label: '8 Ball' },
  { id: 'indie-clock', pack: 'indie', src: '/assets/stickers/indie/clock.png', label: 'Vintage Clock' },
  { id: 'indie-leaf', pack: 'indie', src: '/assets/stickers/indie/leaf.png', label: 'Autumn Leaf' },
  { id: 'indie-swirl', pack: 'indie', src: '/assets/stickers/indie/swirl.png', label: 'Swirl Marble' },
  { id: 'indie-love-note', pack: 'indie', src: '/assets/stickers/indie/love_note.png', label: 'Love Note' },
  { id: 'indie-my-word', pack: 'indie', src: '/assets/stickers/indie/my_word.png', label: 'My Cutout' },
  { id: 'indie-music-word', pack: 'indie', src: '/assets/stickers/indie/music_word.png', label: 'Music Cutout' },

  // Pack 2: Kawaii Food (cute-mini-stickers-sheet)
  { id: 'kawaii-donut', pack: 'kawaii', src: '/assets/stickers/kawaii/donut.png', label: 'Pink Donut' },
  { id: 'kawaii-milk', pack: 'kawaii', src: '/assets/stickers/kawaii/milk.png', label: 'Happy Milk' },
  { id: 'kawaii-pancakes', pack: 'kawaii', src: '/assets/stickers/kawaii/pancakes.png', label: 'Pancakes' },
  { id: 'kawaii-coffee', pack: 'kawaii', src: '/assets/stickers/kawaii/coffee.png', label: 'Mint Coffee' },
  { id: 'kawaii-sushi', pack: 'kawaii', src: '/assets/stickers/kawaii/sushi.png', label: 'Sushi' },
  { id: 'kawaii-onigiri', pack: 'kawaii', src: '/assets/stickers/kawaii/onigiri.png', label: 'Onigiri' },
  { id: 'kawaii-dango', pack: 'kawaii', src: '/assets/stickers/kawaii/dango.png', label: 'Dango' },
  { id: 'kawaii-croissant', pack: 'kawaii', src: '/assets/stickers/kawaii/croissant.png', label: 'Croissant' },
  { id: 'kawaii-taco', pack: 'kawaii', src: '/assets/stickers/kawaii/taco.png', label: 'Taco' },
  { id: 'kawaii-burger', pack: 'kawaii', src: '/assets/stickers/kawaii/burger.png', label: 'Burger' },
  { id: 'kawaii-pizza', pack: 'kawaii', src: '/assets/stickers/kawaii/pizza.png', label: 'Pizza' },
  { id: 'kawaii-waffle', pack: 'kawaii', src: '/assets/stickers/kawaii/waffle.png', label: 'Waffle' },
  { id: 'kawaii-pretzel', pack: 'kawaii', src: '/assets/stickers/kawaii/pretzel.png', label: 'Pretzel' },
  { id: 'kawaii-juice', pack: 'kawaii', src: '/assets/stickers/kawaii/juice.png', label: 'Orange Juice' },
  { id: 'kawaii-egg-round', pack: 'kawaii', src: '/assets/stickers/kawaii/egg_round.png', label: 'Sunny Egg' },
  { id: 'kawaii-egg-flat', pack: 'kawaii', src: '/assets/stickers/kawaii/egg_flat.png', label: 'Sparkle Egg' },
  { id: 'kawaii-syrup', pack: 'kawaii', src: '/assets/stickers/kawaii/syrup.png', label: 'Maple Syrup' },
  { id: 'kawaii-sriracha', pack: 'kawaii', src: '/assets/stickers/kawaii/sriracha.png', label: 'Chili Sauce' },
  { id: 'kawaii-shrimp', pack: 'kawaii', src: '/assets/stickers/kawaii/shrimp.png', label: 'Tempura Shrimp' },
  { id: 'kawaii-drumstick', pack: 'kawaii', src: '/assets/stickers/kawaii/drumstick.png', label: 'Drumstick' },
  { id: 'kawaii-bacon', pack: 'kawaii', src: '/assets/stickers/kawaii/bacon.png', label: 'Bacon' },
  { id: 'kawaii-heart', pack: 'kawaii', src: '/assets/stickers/kawaii/heart.png', label: 'Heart' },

  // Pack 3: Oooh Cosy (download_d58c431b.jpg)
  { id: 'cosy-blue-cat', pack: 'cosy', src: '/assets/stickers/cosy/blue_cat.png', label: 'Blue Cat' },
  { id: 'cosy-laptop', pack: 'cosy', src: '/assets/stickers/cosy/laptop.png', label: 'Smiley Laptop' },
  { id: 'cosy-open-book', pack: 'cosy', src: '/assets/stickers/cosy/open_book.png', label: 'Open Journal' },
  { id: 'cosy-mug', pack: 'cosy', src: '/assets/stickers/cosy/mug.png', label: 'Striped Mug' },
  { id: 'cosy-candle-flower', pack: 'cosy', src: '/assets/stickers/cosy/candle_flower.png', label: 'Flower Candle' },
  { id: 'cosy-cherry-balm', pack: 'cosy', src: '/assets/stickers/cosy/cherry_balm.png', label: 'Cherry Balm' },
  { id: 'cosy-bow', pack: 'cosy', src: '/assets/stickers/cosy/bow.png', label: 'Check Bow' },
  { id: 'cosy-socks', pack: 'cosy', src: '/assets/stickers/cosy/socks.png', label: 'Cosy Socks' },
  { id: 'cosy-lamp', pack: 'cosy', src: '/assets/stickers/cosy/lamp.png', label: 'Table Lamp' },
  { id: 'cosy-cushion', pack: 'cosy', src: '/assets/stickers/cosy/cushion.png', label: 'Plaid Cushion' },
  { id: 'cosy-cloud', pack: 'cosy', src: '/assets/stickers/cosy/cloud.png', label: 'Sleepy Cloud' },
  { id: 'cosy-tomato-soup', pack: 'cosy', src: '/assets/stickers/cosy/tomato_soup.png', label: 'Tomato Soup' },
  { id: 'cosy-pot', pack: 'cosy', src: '/assets/stickers/cosy/pot.png', label: 'Cosy Pot' },
  { id: 'cosy-chocolate', pack: 'cosy', src: '/assets/stickers/cosy/chocolate.png', label: 'Chocolate Bar' },
  { id: 'cosy-lemon', pack: 'cosy', src: '/assets/stickers/cosy/lemon.png', label: 'Lemon Slice' },
  { id: 'cosy-newspaper', pack: 'cosy', src: '/assets/stickers/cosy/newspaper.png', label: 'Crossword Paper' },
  { id: 'cosy-twist-candle', pack: 'cosy', src: '/assets/stickers/cosy/twist_candle.png', label: 'Twist Candle' },
  { id: 'cosy-cold-flu', pack: 'cosy', src: '/assets/stickers/cosy/cold_flu.png', label: 'Tea Box' },

  // Pack 4: Street & Pop (image_bb54f12f.png)
  { id: 'pop-rubiks', pack: 'pop', src: '/assets/stickers/pop/rubiks.png', label: 'Cube' },
  { id: 'pop-ghost', pack: 'pop', src: '/assets/stickers/pop/ghost.png', label: 'Happy Ghost' },
  { id: 'pop-duck', pack: 'pop', src: '/assets/stickers/pop/duck.png', label: 'Yellow Duck' },
  { id: 'pop-haring-heart', pack: 'pop', src: '/assets/stickers/pop/haring_heart.png', label: 'Pop Heart' },
  { id: 'pop-wifi', pack: 'pop', src: '/assets/stickers/pop/wifi.png', label: 'Wi-Fi' },
  { id: 'pop-dice', pack: 'pop', src: '/assets/stickers/pop/dice.png', label: 'Dice' },
  { id: 'pop-bunny', pack: 'pop', src: '/assets/stickers/pop/bunny_white.png', label: 'Cool Bunny' },
  { id: 'pop-smiley', pack: 'pop', src: '/assets/stickers/pop/smiley_drip.png', label: 'Drip Smiley' },
  { id: 'pop-cards', pack: 'pop', src: '/assets/stickers/pop/cards.png', label: 'Ace Cards' },
];

export const PAPER_STYLES: { id: PaperStyleId; className: string; swatch: string }[] = [
  { id: 'lined', className: 'paper-lined', swatch: '#fffdf8' },
  { id: 'dotted', className: 'paper-dotted', swatch: '#faf7ff' },
  { id: 'grid', className: 'paper-grid', swatch: '#f7f4ff' },
  { id: 'lavender', className: 'paper-lavender', swatch: '#efe7ff' },
  { id: 'blush', className: 'paper-blush', swatch: '#ffeef4' },
];

export const INK_COLORS = [
  { id: 'plum-ink', hex: '#2c2142', name: 'Deep Plum' },
  { id: 'violet', hex: '#6842a8', name: 'Royal Violet' },
  { id: 'berry', hex: '#b83b6e', name: 'Berry Rose' },
  { id: 'forest', hex: '#256353', name: 'Forest Sage' },
  { id: 'cobalt', hex: '#285291', name: 'Midnight Blue' },
];

export const NOTE_FONTS: { id: NoteFontId; className: string }[] = [
  { id: 'body', className: 'font-body' },
  { id: 'hand', className: 'font-hand' },
  { id: 'editorial', className: 'font-editorial' },
  { id: 'mono', className: 'font-mono' },
];

export const SUPPORTED_LANGUAGES: {
  code: LanguageCode;
  nativeName: string;
  englishName: string;
  sampleText: string;
  shortCode: string;
}[] = [
  { code: 'hy', nativeName: 'Հայերեն', englishName: 'Armenian', sampleText: 'Իմ գրառումները · Բարի գալուստ', shortCode: 'HY' },
  { code: 'en', nativeName: 'English', englishName: 'English', sampleText: 'My cozy notes · Good ideas', shortCode: 'EN' },
  { code: 'ru', nativeName: 'Русский', englishName: 'Russian', sampleText: 'Мои заметки · Тёплые мысли', shortCode: 'RU' },
  { code: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi', sampleText: 'मेरे नोट्स · सुंदर विचार', shortCode: 'HI' },
  { code: 'es', nativeName: 'Español', englishName: 'Spanish', sampleText: 'Mis notas · Ideas bonitas', shortCode: 'ES' },
  { code: 'fr', nativeName: 'Français', englishName: 'French', sampleText: 'Mes notes · Douces pensées', shortCode: 'FR' },
  { code: 'ja', nativeName: '日本語', englishName: 'Japanese', sampleText: 'マイノート · すてきな記録', shortCode: 'JA' },
  { code: 'ko', nativeName: '한국어', englishName: 'Korean', sampleText: '나의 노트 · 소중한 기록', shortCode: 'KO' },
];

export function getCoverById(id: CoverStyleId): NotebookCoverStyle {
  return NOTEBOOK_COVERS.find((c) => c.id === id) || NOTEBOOK_COVERS[0];
}
