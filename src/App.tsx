import { useCallback, useEffect, useRef, useState } from 'react';
import { AuthModal } from './components/AuthModal';
import { BookshelfView } from './components/BookshelfView';
import { DeskAtmosphere } from './components/DeskAtmosphere';
import { LanguageModal } from './components/LanguageModal';
import { NotebookStudio } from './components/NotebookStudio';
import { NotebookStylePicker } from './components/NotebookStylePicker';
import { TopBar } from './components/TopBar';
import { getCoverById, SUPPORTED_LANGUAGES } from './data/catalog';
import { TRANSLATIONS } from './i18n/translations';
import type {
  AppScreen,
  CoverStyleId,
  LanguageCode,
  Notebook,
  UserProfile,
} from './types/booknote';
import {
  createNotebookApi,
  deleteNotebookApi,
  fetchMe,
  fetchNotebooks,
  saveNotebookApi,
  updatePreferences,
} from './utils/api';
import { soundFX } from './utils/sound';

const GUEST_STORAGE_KEY = 'booknote_guest_notebooks_v1';
const LANG_STORAGE_KEY = 'booknote_ui_language_v1';

function detectInitialLanguage(): LanguageCode {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY) as LanguageCode | null;
    if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
      return saved;
    }
    const nav = (navigator.language || 'en').slice(0, 2).toLowerCase() as LanguageCode;
    if (SUPPORTED_LANGUAGES.some((l) => l.code === nav)) {
      return nav;
    }
  } catch {
    // ignore
  }
  return 'en';
}

function loadGuestNotebooks(): Notebook[] {
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Notebook[]) : [];
  } catch {
    return [];
  }
}

function computeLocalStars(books: Notebook[]): number {
  let stars = books.length * 5;
  for (const nb of books) {
    stars += nb.coverStickers.length;
    for (const pg of nb.pages) {
      stars += Math.min(15, Math.floor((pg.content.trim().length + pg.title.trim().length) / 25));
      stars += pg.stickers.length;
    }
  }
  return stars;
}

export default function App() {
  const [language, setLanguage] = useState<LanguageCode>(detectInitialLanguage);
  const [screen, setScreen] = useState<AppScreen>('picker');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [notebooks, setNotebooks] = useState<Notebook[]>(loadGuestNotebooks);
  const [activeNotebookId, setActiveNotebookId] = useState<string | null>(null);
  const [stars, setStars] = useState<number>(() => computeLocalStars(loadGuestNotebooks()));
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'dirty'>('saved');
  const [creatingBook, setCreatingBook] = useState(false);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [langModalOpen, setLangModalOpen] = useState(false);
  const [muted, setMuted] = useState(false);

  const saveTimerRef = useRef<number | null>(null);
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Persist language choice locally + update <html lang>
  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem(LANG_STORAGE_KEY, language);
    } catch {
      // ignore
    }
  }, [language]);

  // Check existing authenticated session on boot
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const me = await fetchMe();
      if (cancelled || !me) return;
      setUser(me.user);
      if (me.user.language && TRANSLATIONS[me.user.language]) {
        setLanguage(me.user.language);
      }
      try {
        const res = await fetchNotebooks();
        if (cancelled) return;
        setNotebooks(res.notebooks);
        setStars(res.stars);
        if (res.notebooks.length > 0) {
          setScreen('shelf');
        }
      } catch {
        // keep current state
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Save guest drafts locally whenever notebooks change while logged out
  useEffect(() => {
    if (!user) {
      try {
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(notebooks));
      } catch {
        // ignore
      }
      setStars(computeLocalStars(notebooks));
    }
  }, [notebooks, user]);

  const activeNotebook = notebooks.find((n) => n.id === activeNotebookId) || null;

  const handleToggleMute = () => {
    const next = !muted;
    setMuted(next);
    soundFX.setMuted(next);
    if (!next) soundFX.playTap();
  };

  const handleSelectLanguage = async (nextLang: LanguageCode) => {
    setLanguage(nextLang);
    if (user) {
      try {
        const res = await updatePreferences({ language: nextLang });
        setUser(res.user);
      } catch {
        // ignore
      }
    }
  };

  const handleSelectNotebookStyle = async (coverId: CoverStyleId, title: string) => {
    setCreatingBook(true);
    const coverMeta = getCoverById(coverId);
    const now = new Date().toISOString();
    const initialPages = [
      {
        id: crypto.randomUUID ? crypto.randomUUID() : `pg-${Date.now()}`,
        title: '',
        content: '',
        inkColor: '#2c2142',
        fontStyle: 'body' as const,
        fontSize: 17,
        stickers: [],
      },
    ];

    try {
      if (user) {
        const res = await createNotebookApi({
          title,
          coverId,
          paperStyle: coverMeta.defaultPaper,
          coverStickers: [],
          pages: initialPages,
        });
        setNotebooks((prev) => [res.notebook, ...prev]);
        setStars(res.stars);
        setActiveNotebookId(res.notebook.id);
      } else {
        const localBook: Notebook = {
          id: crypto.randomUUID ? crypto.randomUUID() : `book-${Date.now()}`,
          userId: 'guest',
          title,
          coverId,
          paperStyle: coverMeta.defaultPaper,
          coverStickers: [],
          pages: initialPages,
          createdAt: now,
          updatedAt: now,
        };
        setNotebooks((prev) => [localBook, ...prev]);
        setActiveNotebookId(localBook.id);
      }
      setSaveStatus('saved');
      setScreen('studio');
    } finally {
      setCreatingBook(false);
    }
  };

  const flushSaveNotebook = useCallback(
    async (book: Notebook) => {
      if (!user) {
        setSaveStatus('saved');
        return;
      }
      setSaveStatus('saving');
      try {
        const res = await saveNotebookApi(book.id, {
          title: book.title,
          coverId: book.coverId,
          paperStyle: book.paperStyle,
          coverStickers: book.coverStickers,
          pages: book.pages,
        });
        setStars(res.stars);
        setSaveStatus('saved');
      } catch {
        setSaveStatus('dirty');
      }
    },
    [user]
  );

  const handleChangeNotebook = (updated: Notebook) => {
    const stamped: Notebook = { ...updated, updatedAt: new Date().toISOString() };
    setNotebooks((prev) => prev.map((n) => (n.id === stamped.id ? stamped : n)));

    if (!user) {
      setSaveStatus('saved');
      return;
    }

    setSaveStatus('saving');
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = window.setTimeout(() => {
      flushSaveNotebook(stamped);
    }, 800);
  };

  const handleManualSave = () => {
    if (!activeNotebook) return;
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }
    flushSaveNotebook(activeNotebook);
  };

  const handleDeleteNotebook = async (id: string) => {
    if (user) {
      try {
        const res = await deleteNotebookApi(id);
        setStars(res.stars);
      } catch {
        return;
      }
    }
    setNotebooks((prev) => prev.filter((n) => n.id !== id));
    if (activeNotebookId === id) {
      setActiveNotebookId(null);
      setScreen('shelf');
    }
  };

  const handleAuthSuccess = async (authedUser: UserProfile) => {
    setUser(authedUser);
    // Sync any guest drafts up to the user's account so nothing written is lost!
    const guestBooks = loadGuestNotebooks();
    if (guestBooks.length > 0) {
      for (const gb of guestBooks) {
        try {
          await createNotebookApi({
            title: gb.title,
            coverId: gb.coverId,
            paperStyle: gb.paperStyle,
            coverStickers: gb.coverStickers,
            pages: gb.pages,
          });
        } catch {
          // ignore individual failure
        }
      }
      try {
        localStorage.removeItem(GUEST_STORAGE_KEY);
      } catch {
        // ignore
      }
    }

    try {
      const res = await fetchNotebooks();
      setNotebooks(res.notebooks);
      setStars(res.stars);
      if (activeNotebookId && res.notebooks.length > 0 && screen === 'studio') {
        setActiveNotebookId(res.notebooks[0].id);
      }
    } catch {
      // ignore
    }
  };

  const handleLoggedOut = () => {
    setUser(null);
    const guest = loadGuestNotebooks();
    setNotebooks(guest);
    setStars(computeLocalStars(guest));
    setActiveNotebookId(null);
    setScreen('picker');
  };

  const handleBack = () => {
    soundFX.playTap();
    if (screen === 'studio') {
      setScreen('shelf');
    } else if (screen === 'shelf') {
      setScreen('picker');
    }
  };

  return (
    <div className="min-h-screen bg-booknote-gingham relative flex flex-col">
      <DeskAtmosphere
        goodNotesText={t.goodNotesSticky}
        writeIdeasText={t.writeIdeasSticky}
        compact={screen === 'studio'}
      />

      <TopBar
        screen={screen}
        onBack={handleBack}
        onOpenShelf={() => {
          soundFX.playTap();
          setScreen('shelf');
        }}
        onOpenLanguage={() => {
          soundFX.playTap();
          setLangModalOpen(true);
        }}
        onOpenAuth={() => {
          soundFX.playTap();
          setAuthModalOpen(true);
        }}
        language={language}
        stars={stars}
        user={user}
        muted={muted}
        onToggleMute={handleToggleMute}
        t={t}
        notebookCount={notebooks.length}
      />

      <main className="flex-1 flex flex-col justify-center">
        {screen === 'picker' && (
          <NotebookStylePicker
            t={t}
            onSelectStyle={handleSelectNotebookStyle}
            isBusy={creatingBook}
          />
        )}

        {screen === 'shelf' && (
          <BookshelfView
            t={t}
            notebooks={notebooks}
            user={user}
            onOpenNotebook={(nb) => {
              setActiveNotebookId(nb.id);
              setSaveStatus('saved');
              setScreen('studio');
            }}
            onDeleteNotebook={handleDeleteNotebook}
            onCreateNew={() => setScreen('picker')}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {screen === 'studio' && activeNotebook && (
          <NotebookStudio
            notebook={activeNotebook}
            onChangeNotebook={handleChangeNotebook}
            onManualSave={handleManualSave}
            saveStatus={saveStatus}
            user={user}
            onOpenAuth={() => setAuthModalOpen(true)}
            t={t}
          />
        )}
      </main>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        user={user}
        language={language}
        t={t}
        onAuthSuccess={handleAuthSuccess}
        onLoggedOut={handleLoggedOut}
      />

      <LanguageModal
        isOpen={langModalOpen}
        onClose={() => setLangModalOpen(false)}
        language={language}
        onSelectLanguage={handleSelectLanguage}
        t={t}
      />
    </div>
  );
}
