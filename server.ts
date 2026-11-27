import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
function resolveDataDir(): string {
  const localDir = path.resolve(__dirname, 'data');
  try {
    fs.mkdirSync(localDir, { recursive: true });
    fs.accessSync(localDir, fs.constants.W_OK);
    return localDir;
  } catch {
    const tmpDir = path.join(os.tmpdir(), 'booknote-data');
    fs.mkdirSync(tmpDir, { recursive: true });
    return tmpDir;
  }
}
const DATA_DIR = resolveDataDir();
const DB_FILE = path.join(DATA_DIR, 'booknote-db.json');

// Session signing secret from env with ephemeral fallback
const SESSION_SECRET = process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16
  ? process.env.SESSION_SECRET
  : crypto.randomBytes(32).toString('hex');

const VALID_LANGUAGES = new Set(['en', 'hy', 'ru', 'hi', 'es', 'fr', 'ja', 'ko']);
const VALID_COVERS = new Set([
  'star-xo',
  'love-pop',
  'kuromi-plaid',
  'music-grid',
  'kawaii-pink',
  'travel-scrapbook',
]);
const VALID_PAPERS = new Set(['lined', 'dotted', 'grid', 'lavender', 'blush']);
const VALID_FONTS = new Set(['body', 'hand', 'editorial', 'mono']);

interface StoredPlacedSticker {
  id: string;
  stickerId: string;
  src: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
}

interface StoredPage {
  id: string;
  title: string;
  content: string;
  inkColor: string;
  fontStyle: string;
  fontSize: number;
  stickers: StoredPlacedSticker[];
}

interface StoredNotebook {
  id: string;
  userId: string;
  title: string;
  coverId: string;
  paperStyle: string;
  coverStickers: StoredPlacedSticker[];
  pages: StoredPage[];
  createdAt: string;
  updatedAt: string;
}

interface StoredUser {
  id: string;
  username: string;
  usernameLower: string;
  displayName: string;
  passwordSalt: string;
  passwordHash: string;
  language: string;
  stars: number;
  createdAt: string;
}

interface DatabaseSchema {
  users: StoredUser[];
  notebooks: StoredNotebook[];
}

function ensureDb(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const empty: DatabaseSchema = { users: [], notebooks: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(empty, null, 2), 'utf8');
    return empty;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<DatabaseSchema>;
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      notebooks: Array.isArray(parsed.notebooks) ? parsed.notebooks : [],
    };
  } catch {
    const empty: DatabaseSchema = { users: [], notebooks: [] };
    return empty;
  }
}

let dbState: DatabaseSchema = ensureDb();
let writeChain: Promise<void> = Promise.resolve();

function persistDb(): Promise<void> {
  const snapshot = JSON.stringify(dbState, null, 2);
  writeChain = writeChain.then(async () => {
    const tmpFile = `${DB_FILE}.${crypto.randomBytes(6).toString('hex')}.tmp`;
    await fs.promises.writeFile(tmpFile, snapshot, 'utf8');
    await fs.promises.rename(tmpFile, DB_FILE);
  });
  return writeChain;
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  const derived = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHash, 'hex');
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

function signToken(userId: string): string {
  const payload = Buffer.from(
    JSON.stringify({ uid: userId, iat: Date.now(), exp: Date.now() + 1000 * 60 * 60 * 24 * 30 }),
    'utf8'
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyToken(token: string): string | null {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      uid?: string;
      exp?: number;
    };
    if (!parsed.uid || typeof parsed.exp !== 'number' || parsed.exp < Date.now()) {
      return null;
    }
    return parsed.uid;
  } catch {
    return null;
  }
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx > 0) {
      const k = part.slice(0, idx).trim();
      const v = part.slice(idx + 1).trim();
      out[k] = decodeURIComponent(v);
    }
  }
  return out;
}

function setSessionCookie(req: Request, res: Response, token: string): void {
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
  const parts = [
    `booknote_session=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    `Max-Age=${60 * 60 * 24 * 30}`,
  ];
  if (isHttps) {
    parts.push('Secure', 'SameSite=None', 'Partitioned');
  } else {
    parts.push('SameSite=Lax');
  }
  res.setHeader('Set-Cookie', parts.join('; '));
}

function clearSessionCookie(req: Request, res: Response): void {
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
  const parts = ['booknote_session=', 'Path=/', 'HttpOnly', 'Max-Age=0'];
  if (isHttps) {
    parts.push('Secure', 'SameSite=None', 'Partitioned');
  } else {
    parts.push('SameSite=Lax');
  }
  res.setHeader('Set-Cookie', parts.join('; '));
}

function sanitizePlacedStickers(input: unknown): StoredPlacedSticker[] {
  if (!Array.isArray(input)) return [];
  const out: StoredPlacedSticker[] = [];
  for (const raw of input.slice(0, 60)) {
    if (!raw || typeof raw !== 'object') continue;
    const s = raw as Record<string, unknown>;
    const src = typeof s.src === 'string' ? s.src : '';
    if (!src.startsWith('/assets/stickers/')) continue;
    out.push({
      id: typeof s.id === 'string' ? s.id.slice(0, 64) : crypto.randomUUID(),
      stickerId: typeof s.stickerId === 'string' ? s.stickerId.slice(0, 64) : 'custom',
      src: src.slice(0, 200),
      x: typeof s.x === 'number' && Number.isFinite(s.x) ? Math.max(0, Math.min(100, s.x)) : 50,
      y: typeof s.y === 'number' && Number.isFinite(s.y) ? Math.max(0, Math.min(100, s.y)) : 50,
      scale: typeof s.scale === 'number' && Number.isFinite(s.scale) ? Math.max(0.4, Math.min(2.5, s.scale)) : 1,
      rotation: typeof s.rotation === 'number' && Number.isFinite(s.rotation) ? Math.max(-180, Math.min(180, s.rotation)) : 0,
      zIndex: typeof s.zIndex === 'number' && Number.isFinite(s.zIndex) ? Math.max(1, Math.min(200, Math.round(s.zIndex))) : 1,
    });
  }
  return out;
}

function sanitizePages(input: unknown): StoredPage[] {
  if (!Array.isArray(input) || input.length === 0) {
    return [
      {
        id: crypto.randomUUID(),
        title: '',
        content: '',
        inkColor: '#2c2142',
        fontStyle: 'body',
        fontSize: 17,
        stickers: [],
      },
    ];
  }
  return input.slice(0, 50).map((raw) => {
    const p = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
    const inkColor = typeof p.inkColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(p.inkColor)
      ? p.inkColor
      : '#2c2142';
    const fontStyle = typeof p.fontStyle === 'string' && VALID_FONTS.has(p.fontStyle) ? p.fontStyle : 'body';
    const fontSize = typeof p.fontSize === 'number' && Number.isFinite(p.fontSize)
      ? Math.max(13, Math.min(28, Math.round(p.fontSize)))
      : 17;
    return {
      id: typeof p.id === 'string' ? p.id.slice(0, 64) : crypto.randomUUID(),
      title: typeof p.title === 'string' ? p.title.slice(0, 120) : '',
      content: typeof p.content === 'string' ? p.content.slice(0, 20000) : '',
      inkColor,
      fontStyle,
      fontSize,
      stickers: sanitizePlacedStickers(p.stickers),
    };
  });
}

function computeNotebookStars(userNotebooks: StoredNotebook[]): number {
  let stars = userNotebooks.length * 5;
  for (const nb of userNotebooks) {
    stars += nb.coverStickers.length;
    for (const pg of nb.pages) {
      const charScore = Math.min(15, Math.floor((pg.content.trim().length + pg.title.trim().length) / 25));
      stars += charScore + pg.stickers.length;
    }
  }
  return stars;
}

function publicUser(u: StoredUser) {
  return {
    id: u.id,
    username: u.username,
    displayName: u.displayName,
    language: u.language,
    stars: u.stars,
    createdAt: u.createdAt,
  };
}

interface AuthedRequest extends Request {
  authUser?: StoredUser;
}

function requireCsrfHeader(req: Request, res: Response, next: NextFunction): void {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const xrw = req.headers['x-requested-with'];
    const origin = req.headers.origin;
    const host = (req.headers['x-forwarded-host'] || req.headers.host || '') as string;
    const originHost = origin ? (() => {
      try {
        return new URL(origin).host;
      } catch {
        return '';
      }
    })() : '';
    if (xrw !== 'BookNote' && (!originHost || originHost !== host)) {
      res.status(403).json({ error: 'Forbidden request origin' });
      return;
    }
  }
  next();
}

function authenticate(req: AuthedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  let token = '';
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else {
    const cookies = parseCookies(req.headers.cookie);
    token = cookies.booknote_session || '';
  }
  const uid = verifyToken(token);
  if (!uid) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  const user = dbState.users.find((u) => u.id === uid);
  if (!user) {
    res.status(401).json({ error: 'Session expired' });
    return;
  }
  req.authUser = user;
  next();
}

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '2mb' }));

  app.use('/api', (_req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
  });

  app.use('/api', requireCsrfHeader);

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/api/auth/register', async (req: Request, res: Response) => {
    const body = (req.body && typeof req.body === 'object' ? req.body : {}) as Record<string, unknown>;
    const rawUsername = typeof body.username === 'string' ? body.username.trim() : '';
    const rawDisplay = typeof body.displayName === 'string' ? body.displayName.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const language = typeof body.language === 'string' && VALID_LANGUAGES.has(body.language)
      ? body.language
      : 'en';

    if (rawUsername.length < 2 || rawUsername.length > 40) {
      res.status(400).json({ error: 'Username must be 2–40 characters' });
      return;
    }
    if (password.length < 6 || password.length > 128) {
      res.status(400).json({ error: 'Password must be 6–128 characters' });
      return;
    }

    const usernameLower = rawUsername.toLocaleLowerCase('en-US');
    if (dbState.users.some((u) => u.usernameLower === usernameLower)) {
      res.status(409).json({ error: 'Username is already taken' });
      return;
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      username: rawUsername,
      usernameLower,
      displayName: (rawDisplay || rawUsername).slice(0, 60),
      passwordSalt: salt,
      passwordHash: hashPassword(password, salt),
      language,
      stars: 0,
      createdAt: new Date().toISOString(),
    };

    dbState.users.push(newUser);
    await persistDb();

    const token = signToken(newUser.id);
    setSessionCookie(req, res, token);
    res.status(201).json({ user: publicUser(newUser), token });
  });

  app.post('/api/auth/login', async (req: Request, res: Response) => {
    const body = (req.body && typeof req.body === 'object' ? req.body : {}) as Record<string, unknown>;
    const rawUsername = typeof body.username === 'string' ? body.username.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    const usernameLower = rawUsername.toLocaleLowerCase('en-US');
    const user = dbState.users.find((u) => u.usernameLower === usernameLower);
    if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    const token = signToken(user.id);
    setSessionCookie(req, res, token);
    res.json({ user: publicUser(user), token });
  });

  app.post('/api/auth/logout', (req: Request, res: Response) => {
    clearSessionCookie(req, res);
    res.json({ ok: true });
  });

  app.get('/api/auth/me', authenticate, (req: AuthedRequest, res: Response) => {
    res.json({ user: publicUser(req.authUser!) });
  });

  app.patch('/api/auth/preferences', authenticate, async (req: AuthedRequest, res: Response) => {
    const body = (req.body && typeof req.body === 'object' ? req.body : {}) as Record<string, unknown>;
    const user = req.authUser!;
    if (typeof body.language === 'string' && VALID_LANGUAGES.has(body.language)) {
      user.language = body.language;
    }
    if (typeof body.displayName === 'string' && body.displayName.trim().length > 0) {
      user.displayName = body.displayName.trim().slice(0, 60);
    }
    await persistDb();
    res.json({ user: publicUser(user) });
  });

  app.get('/api/notebooks', authenticate, (req: AuthedRequest, res: Response) => {
    const list = dbState.notebooks
      .filter((n) => n.userId === req.authUser!.id)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    res.json({ notebooks: list, stars: req.authUser!.stars });
  });

  app.post('/api/notebooks', authenticate, async (req: AuthedRequest, res: Response) => {
    const user = req.authUser!;
    const body = (req.body && typeof req.body === 'object' ? req.body : {}) as Record<string, unknown>;
    const title = typeof body.title === 'string' ? body.title.trim().slice(0, 120) : '';
    const coverId = typeof body.coverId === 'string' && VALID_COVERS.has(body.coverId)
      ? body.coverId
      : 'star-xo';
    const paperStyle = typeof body.paperStyle === 'string' && VALID_PAPERS.has(body.paperStyle)
      ? body.paperStyle
      : 'lined';

    const now = new Date().toISOString();
    const notebook: StoredNotebook = {
      id: crypto.randomUUID(),
      userId: user.id,
      title: title || 'My BookNote',
      coverId,
      paperStyle,
      coverStickers: sanitizePlacedStickers(body.coverStickers),
      pages: sanitizePages(body.pages),
      createdAt: now,
      updatedAt: now,
    };

    dbState.notebooks.push(notebook);
    const userBooks = dbState.notebooks.filter((n) => n.userId === user.id);
    user.stars = Math.max(user.stars, computeNotebookStars(userBooks));
    await persistDb();

    res.status(201).json({ notebook, stars: user.stars });
  });

  app.put('/api/notebooks/:id', authenticate, async (req: AuthedRequest, res: Response) => {
    const user = req.authUser!;
    const nb = dbState.notebooks.find((n) => n.id === req.params.id && n.userId === user.id);
    if (!nb) {
      res.status(404).json({ error: 'Notebook not found' });
      return;
    }

    const body = (req.body && typeof req.body === 'object' ? req.body : {}) as Record<string, unknown>;
    if (typeof body.title === 'string') {
      nb.title = body.title.trim().slice(0, 120) || nb.title;
    }
    if (typeof body.coverId === 'string' && VALID_COVERS.has(body.coverId)) {
      nb.coverId = body.coverId;
    }
    if (typeof body.paperStyle === 'string' && VALID_PAPERS.has(body.paperStyle)) {
      nb.paperStyle = body.paperStyle;
    }
    if (body.coverStickers !== undefined) {
      nb.coverStickers = sanitizePlacedStickers(body.coverStickers);
    }
    if (body.pages !== undefined) {
      nb.pages = sanitizePages(body.pages);
    }
    nb.updatedAt = new Date().toISOString();

    const userBooks = dbState.notebooks.filter((n) => n.userId === user.id);
    user.stars = Math.max(user.stars, computeNotebookStars(userBooks));
    await persistDb();

    res.json({ notebook: nb, stars: user.stars });
  });

  app.delete('/api/notebooks/:id', authenticate, async (req: AuthedRequest, res: Response) => {
    const user = req.authUser!;
    const idx = dbState.notebooks.findIndex((n) => n.id === req.params.id && n.userId === user.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Notebook not found' });
      return;
    }
    dbState.notebooks.splice(idx, 1);
    await persistDb();
    res.json({ ok: true, stars: user.stars });
  });

  const distDir = path.resolve(__dirname, 'dist');
  const isProd = process.env.NODE_ENV === 'production' || fs.existsSync(path.join(distDir, 'index.html')) && process.env.NODE_ENV !== 'development';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BookNote server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
