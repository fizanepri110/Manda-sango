'use client';

import { useEffect, useState } from 'react';

import { 
  Heart, 
  Zap, 
  BookOpen, 
  Trophy, 
  Swords, 
  ChevronLeft, 
  Check, 
  X,
  Volume2,
  Globe,
  Home,
  AlertTriangle,
  ShoppingBag,
  Users,
  Calendar,
  Activity,
  Palette,
  HelpCircle,
  MessageCircle,
  Loader
} from 'lucide-react';

import { Word, Language } from './types/word';
import { supabase } from './lib/supabase';

// --- Types ---

interface Category {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  words: Word[];
}

type Screen = 'home' | 'flashcards' | 'quiz' | 'duel' | 'fierte';

interface UserState {
  hearts: number;
  xp: number;
  streak: number;
  completedCategories: string[];
  lastHeartResetDate?: string;
}

const HEARTS_PER_SESSION = 3;
const HEARTS_STORAGE_KEY = 'manda-sango-hearts';
const HEARTS_RESET_DATE_KEY = 'manda-sango-hearts-reset-date';

// Helper: Get hearts from localStorage with daily reset
function getHeartsFromStorage(): { hearts: number; lastResetDate: string } {
  const today = new Date().toISOString().split('T')[0];
  const stored = localStorage.getItem(HEARTS_STORAGE_KEY);
  const storedDate = localStorage.getItem(HEARTS_RESET_DATE_KEY);
  
  if (storedDate === today && stored !== null) {
    return { hearts: parseInt(stored, 10), lastResetDate: storedDate };
  }
  
  // Reset for new day
  localStorage.setItem(HEARTS_STORAGE_KEY, String(HEARTS_PER_SESSION));
  localStorage.setItem(HEARTS_RESET_DATE_KEY, today);
  return { hearts: HEARTS_PER_SESSION, lastResetDate: today };
}

// Helper: Save hearts to localStorage
function saveHeartsToStorage(hearts: number): void {
  localStorage.setItem(HEARTS_STORAGE_KEY, String(hearts));
}

// --- Supabase Client ---

const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL;
const SUPABASE_KEY = (import.meta as any).env.VITE_SUPABASE_KEY;

async function fetchWordsFromSupabase(): Promise<Word[]> {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase.from('mots-sango').select('*');
    if (error) throw error;
    if (!data) return [];
    
    return data.map((item: any) => ({
      id: item.id,
      sango: item.sango,
      fr: item['français'],
      ru: item.russe || '',
      en: item.anglais || 'TODO',
      categorie: item.categorie,
      audio_sango: item.audio_sango,
    }));
  } catch (error) {
    console.error('Error fetching from Supabase:', error);
    return [];
  }
}

// --- Default Data (Fallback) ---

const DEFAULT_VOCABULARY: Category[] = [
  {
    id: 'salutations',
    title: 'Salutations & Phrases',
    icon: <MessageCircle size={24} />,
    color: 'bg-blue-600',
    borderColor: 'border-blue-800',
    words: [
      { id: 1, fr: 'Bonjour / Salut', sango: 'Bara mo / Balaô', ru: 'Привет / Здравствуйте', en: 'TODO', categorie: 'Salutations et Politesse' },
      { id: 2, fr: 'Bienvenue', sango: 'Nzoni gango', ru: 'Добро пожаловать', en: 'TODO', categorie: 'Salutations et Politesse' },
      { id: 3, fr: 'Comment vas-tu ?', sango: 'Töngana nye?', ru: 'Как дела?', en: 'TODO', categorie: 'Salutations et Politesse' },
      { id: 4, fr: 'Je vais bien', sango: 'Mbï yeke sêngê', ru: 'У меня все хорошо', en: 'TODO', categorie: 'Salutations et Politesse' },
      { id: 5, fr: 'Merci', sango: 'Singîla', ru: 'Спасибо', en: 'TODO', categorie: 'Salutations et Politesse' },
      { id: 6, fr: 'Merci beaucoup', sango: 'Singîla mingi', ru: 'Большое спасибо', en: 'TODO', categorie: 'Salutations et Politesse' },
      { id: 7, fr: 'De rien', sango: 'Asala ye ape', ru: 'Не за что', en: 'TODO', categorie: 'Salutations et Politesse' },
      { id: 8, fr: "S'il te plaît", sango: 'Mbi gbu gere ti mo', ru: 'Пожалуйста', en: 'TODO', categorie: 'Salutations et Politesse' },
      { id: 9, fr: 'Excusez-moi / Pardon', sango: 'Gbu gere ti ala', ru: 'Извините', en: 'TODO', categorie: 'Salutations et Politesse' },
      { id: 10, fr: 'Bonne nuit', sango: 'Lango Njönî', ru: 'Спокойной ночи', en: 'TODO', categorie: 'Salutations et Politesse' },
    ]
  },
  {
    id: 'questions',
    title: 'Questions & Pronoms',
    icon: <HelpCircle size={24} />,
    color: 'bg-yellow-400',
    borderColor: 'border-yellow-600',
    words: [
      { id: 11, fr: 'Qui ?', sango: 'Sô Zua ?', ru: 'Кто?', en: 'TODO', categorie: 'Questions' },
      { id: 12, fr: 'Quoi ?', sango: 'Nye ?', ru: 'Что?', en: 'TODO', categorie: 'Questions' },
      { id: 13, fr: 'Quand ?', sango: 'Lâ wa ?', ru: 'Когда?', en: 'TODO', categorie: 'Questions' },
      { id: 14, fr: 'Où ?', sango: 'Na ndo wa ?', ru: 'Где?', en: 'TODO', categorie: 'Questions' },
      { id: 15, fr: 'Pourquoi ?', sango: 'Ndâli ni nye ?', ru: 'Почему?', en: 'TODO', categorie: 'Questions' },
    ]
  },
  {
    id: 'people',
    title: 'Gens & Identité',
    icon: <Users size={24} />,
    color: 'bg-blue-700',
    borderColor: 'border-blue-900',
    words: [
      { id: 16, fr: 'Quel est ton nom ?', sango: 'Ïrï tî mo nye?', ru: 'Как тебя зовут?', en: 'TODO', categorie: 'Gens' },
      { id: 17, fr: 'Mon nom est...', sango: 'Irï tî mbï...', ru: 'Меня зовут...', en: 'TODO', categorie: 'Gens' },
      { id: 18, fr: 'Homme', sango: 'Kôlï', ru: 'Мужчина', en: 'TODO', categorie: 'Gens' },
      { id: 19, fr: 'Femme', sango: 'Wâlï', ru: 'Женщина', en: 'TODO', categorie: 'Gens' },
      { id: 20, fr: 'Enfant', sango: 'Môlengê', ru: 'Ребенок', en: 'TODO', categorie: 'Gens' },
    ]
  },
  {
    id: 'numbers',
    title: 'Nombres (0-60)',
    icon: '🔢',
    color: 'bg-green-600',
    borderColor: 'border-green-800',
    words: [
      { id: 21, fr: 'Un', sango: 'Ôko', ru: 'Один', en: 'TODO', categorie: 'Nombres' },
      { id: 22, fr: 'Deux', sango: 'Üse', ru: 'Два', en: 'TODO', categorie: 'Nombres' },
      { id: 23, fr: 'Trois', sango: 'Otâ', ru: 'Три', en: 'TODO', categorie: 'Nombres' },
      { id: 24, fr: 'Quatre', sango: 'Osiô', ru: 'Четыре', en: 'TODO', categorie: 'Nombres' },
      { id: 25, fr: 'Cinq', sango: 'Okuë', ru: 'Пять', en: 'TODO', categorie: 'Nombres' },
    ]
  },
  {
    id: 'time_colors',
    title: 'Temps & Couleurs',
    icon: <Palette size={24} />,
    color: 'bg-white',
    borderColor: 'border-slate-300',
    words: [
      { id: 26, fr: 'Noir', sango: 'Vûko', ru: 'Черный', en: 'TODO', categorie: 'Temps et Couleurs' },
      { id: 27, fr: 'Blanc', sango: 'Vuru', ru: 'Белый', en: 'TODO', categorie: 'Temps et Couleurs' },
      { id: 28, fr: 'Rouge', sango: 'Bengba', ru: 'Красный', en: 'TODO', categorie: 'Temps et Couleurs' },
      { id: 29, fr: 'Vert', sango: 'Ngu ngunza', ru: 'Зеленый', en: 'TODO', categorie: 'Temps et Couleurs' },
      { id: 30, fr: 'Jaune', sango: 'Kambiri', ru: 'Желтый', en: 'TODO', categorie: 'Temps et Couleurs' },
    ]
  },
  {
    id: 'market_food',
    title: 'Marché & Nourriture',
    icon: <ShoppingBag size={24} />,
    color: 'bg-yellow-500',
    borderColor: 'border-yellow-700',
    words: [
      { id: 31, fr: 'Nourriture', sango: 'Kôbe', ru: 'Еда', en: 'TODO', categorie: 'Marché et Nourriture' },
      { id: 32, fr: 'Eau', sango: 'Ngû', ru: 'Вода', en: 'TODO', categorie: 'Marché et Nourriture' },
      { id: 33, fr: 'Pain', sango: 'Mapa', ru: 'Хлеб', en: 'TODO', categorie: 'Marché et Nourriture' },
      { id: 34, fr: 'Riz', sango: 'Lôssô', ru: 'Рис', en: 'TODO', categorie: 'Marché et Nourriture' },
      { id: 35, fr: 'Viande', sango: 'Nyama', ru: 'Мясо', en: 'TODO', categorie: 'Marché et Nourriture' },
    ]
  },
  {
    id: 'verbs',
    title: 'Verbes & Actions',
    icon: <Activity size={24} />,
    color: 'bg-red-500',
    borderColor: 'border-red-700',
    words: [
      { id: 36, fr: 'Être', sango: 'Yeke', ru: 'Быть', en: 'TODO', categorie: 'Verbes' },
      { id: 37, fr: 'Avoir', sango: 'Yekena', ru: 'Иметь', en: 'TODO', categorie: 'Verbes' },
      { id: 38, fr: 'Aller', sango: 'Ti gwe', ru: 'Идти', en: 'TODO', categorie: 'Verbes' },
      { id: 39, fr: 'Venir', sango: 'Ga', ru: 'Приходить', en: 'TODO', categorie: 'Verbes' },
      { id: 40, fr: 'Faire', sango: 'Sala', ru: 'Делать', en: 'TODO', categorie: 'Verbes' },
    ]
  },
  {
    id: 'adjectives',
    title: 'Adjectifs & Urgences',
    icon: <AlertTriangle size={24} />,
    color: 'bg-red-600',
    borderColor: 'border-red-800',
    words: [
      { id: 41, fr: 'Bon / Bien', sango: 'Nzoni', ru: 'Хороший', en: 'TODO', categorie: 'Adjectifs' },
      { id: 42, fr: 'Mauvais', sango: 'Sioni', ru: 'Плохой', en: 'TODO', categorie: 'Adjectifs' },
      { id: 43, fr: 'Grand', sango: 'Kota', ru: 'Большой', en: 'TODO', categorie: 'Adjectifs' },
      { id: 44, fr: 'Petit', sango: 'Kete', ru: 'Маленький', en: 'TODO', categorie: 'Adjectifs' },
      { id: 45, fr: 'Beau / Joli', sango: 'Pendere', ru: 'Красивый', en: 'TODO', categorie: 'Adjectifs' },
    ]
  }
];

// --- Components ---

// Central African Republic Flag SVG
const CARFlag = ({ size = 24 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 900 600"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'inline-block' }}
  >
    {/* Horizontal stripes */}
    <rect width="900" height="100" fill="#0052CC" /> {/* Blue */}
    <rect y="100" width="900" height="100" fill="#00A651" /> {/* Green */}
    <rect y="200" width="900" height="100" fill="#FFCD00" /> {/* Yellow */}
    <rect y="300" width="900" height="100" fill="#FFFFFF" /> {/* White */}
    <rect y="400" width="900" height="100" fill="#CE1126" /> {/* Red */}
    <rect y="500" width="900" height="100" fill="#CE1126" /> {/* Red */}
    
    {/* Vertical red band */}
    <rect width="180" height="600" fill="#CE1126" />
    
    {/* Yellow star in center */}
    <g transform="translate(450, 300)">
      <polygon
        points="0,-40 12,-12 40,-12 20,8 28,40 0,20 -28,40 -20,8 -40,-12 -12,-12"
        fill="#FFCD00"
      />
    </g>
  </svg>
);

// Map language codes to Web Speech API locale codes
const LANG_MAP: { [key: string]: string } = {
  fr: 'fr-FR',
  en: 'en-US',
  ru: 'ru-RU',
  sango: 'fr-FR',
};

// Robust browser text-to-speech:
// - waits for voices to load (they arrive asynchronously; the first call is often empty)
// - picks a voice matching the target language
// - warns clearly if no matching voice is installed on the device
function speakWithVoice(text: string, langCode: string) {
  if (!('speechSynthesis' in window)) {
    alert("La synthèse vocale n'est pas disponible dans ce navigateur.");
    return;
  }

  const target = (LANG_MAP[langCode] || langCode).toLowerCase();
  const prefix = target.split('-')[0]; // e.g. "ru"
  const synth = window.speechSynthesis;

  const speak = () => {
    const voices = synth.getVoices();
    const voice = voices.find(v => v.lang.toLowerCase().startsWith(prefix));
    if (!voice) {
      alert(`La voix « ${langCode.toUpperCase()} » n'est pas installée sur cet appareil, le mot ne peut pas être lu à voix haute.`);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.rate = 0.9;
    synth.cancel();
    synth.speak(utterance);
  };

  // If the voice list isn't ready yet, wait for the browser to load it once.
  if (synth.getVoices().length === 0) {
    synth.addEventListener('voiceschanged', speak, { once: true });
    synth.getVoices(); // kick off the asynchronous load
  } else {
    speak();
  }
}

// A translation audio chip (FR / RU / EN). Shows a 🔊 button when a translation
// exists, or a clear "indisponible" label when the translation is missing.
const LangAudio = ({ flag, label, text, langCode, color }: { flag: string; label: string; text?: string; langCode: string; color: string }) => {
  const hasText = !!(text && text.trim() && text.trim().toUpperCase() !== 'TODO');

  if (!hasText) {
    return (
      <span
        className="flex items-center gap-1 px-3 py-2 bg-slate-100 text-slate-400 rounded font-semibold cursor-not-allowed"
        title={`Traduction ${label} indisponible pour ce mot`}
      >
        {flag} {label} <span className="text-xs">(indisponible)</span>
      </span>
    );
  }

  return (
    <button
      onClick={() => speakWithVoice(text as string, langCode)}
      className={`flex items-center gap-1 px-3 py-2 ${color} rounded font-semibold`}
      title="Cliquez pour écouter"
    >
      {flag} {label} 🔊
    </button>
  );
};

const AudioButton = ({ url, text, langCode }: { url?: string; text?: string; langCode?: string }) => {
  if (!url && (!text || !langCode)) return null;

  const handleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (url) {
      const audio = new Audio(url);
      audio.play().catch(err => console.error('Erreur lecture audio:', err));
    } else if (text && langCode) {
      speakWithVoice(text, langCode);
    }
  };

  return (
    <button
      onClick={handleAudio}
      aria-label="Écouter"
      className="ml-2 hover:opacity-70 transition-opacity text-2xl"
      title="Cliquez pour écouter"
    >
      🔊
    </button>
  );
};


function Header({ userState, currentLang, setLang, goHome }: any) {
  return (
    <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={goHome}>
          <BookOpen size={32} />
          <h1 className="text-2xl font-bold">Manda Sango</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 bg-white/20 rounded-full px-4 py-2">
            <div className="flex items-center gap-2">
              <Heart size={20} className="text-red-300" />
              <span className="font-bold">{userState.hearts}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={20} className="text-yellow-300" />
              <span className="font-bold">{userState.xp}</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy size={20} className="text-amber-300" />
              <span className="font-bold">{userState.streak}</span>
            </div>
          </div>
          
          <select 
            value={currentLang}
            onChange={(e) => setLang(e.target.value as Language)}
            className="bg-white/20 text-white rounded px-3 py-2 font-semibold cursor-pointer flex items-center gap-2"
          >
            <option value="fr">🇫🇷 Français</option>
            <option value="ru">🇷🇺 Русский</option>
            <option value="en">🇬🇧 English</option>
          </select>
          
          <div className="flex items-center gap-2 text-white" title="Drapeau de la République Centrafricaine">
            <CARFlag size={28} />
            <span className="text-sm font-semibold">RCA</span>
          </div>
        </div>
      </div>
    </header>
  );
}

// ===================== SECTION FIERTÉ NATIONALE =====================
// Contenu vérifié (sources : Wikipédia, Ordre de la Libération, présidence RCA).
// Tout est écrit en dur ici — la base Supabase n'est pas concernée.

const ANTHEM = {
  titleSango: 'E Zingo',
  titleFr: 'La Renaissance',
  author: 'Barthélemy Boganda',
  composer: 'Herbert Pepper',
  year: 1960,
  theme:
    "L'hymne célèbre le réveil de la Centrafrique, le courage de son peuple et l'appel à bâtir le pays dans le travail, la dignité et le respect.",
  // Incipit (1re ligne) seulement — extrait court attribué. Les paroles complètes
  // de Boganda sont encore protégées : voir le lien officiel ci-dessous.
  incipitSango: 'Bêafrîka, mbeso tî âBantu…',
  incipitFr: 'Ô Centrafrique, ô berceau des Bantous !…',
  sourceUrl: 'https://fr.wikipedia.org/wiki/La_Renaissance_(hymne)',
};

interface Personnalite {
  emoji: string;
  nom: string;
  dates: string;
  role: string;
  bio: string;
  couleur: string;
}

const PERSONNALITES: Personnalite[] = [
  {
    emoji: '🕊️',
    nom: 'Barthélemy Boganda',
    dates: '1910 – 1959',
    role: 'Père de la nation',
    bio: "Prêtre puis premier député de l'Oubangui-Chari (1946), il fonde le MESAN et proclame la République centrafricaine le 1er décembre 1958. Il meurt dans un accident d'avion en 1959, peu avant l'indépendance.",
    couleur: 'from-emerald-500 to-teal-600',
  },
  {
    emoji: '🎖️',
    nom: 'Lieutenant Georges Koudoukou',
    dates: '1894 – 1942',
    role: 'Premier officier centrafricain',
    bio: "Surnommé « le père des tirailleurs », héros de la bataille de Bir-Hakeim (1942). Fait Compagnon de la Libération à titre posthume, il fut le premier officier africain à recevoir cette distinction.",
    couleur: 'from-amber-500 to-orange-600',
  },
  {
    emoji: '🔥',
    nom: 'Karnou (Barka Ngainoumbey)',
    dates: '? – 1928',
    role: 'Résistant anticolonial',
    bio: "Guide spirituel gbaya, il mène la révolte du Kongo-Wara (1928), l'une des plus grandes résistances africaines à la colonisation. Il est tué par l'armée coloniale en décembre 1928.",
    couleur: 'from-red-500 to-rose-600',
  },
  {
    emoji: '👑',
    nom: 'Jean-Bedel Bokassa',
    dates: '1921 – 1996',
    role: 'Président puis Empereur',
    bio: "Militaire des Forces françaises libres, il prend le pouvoir en 1966 puis se proclame empereur en 1976, avant d'être renversé en 1979. Figure marquante mais controversée de l'histoire du pays.",
    couleur: 'from-indigo-500 to-purple-600',
  },
  {
    emoji: '🏛️',
    nom: 'David Dacko',
    dates: '1930 – 2003',
    role: 'Premier président de la RCA',
    bio: "Cousin et successeur de Boganda, il devient le premier président de la République centrafricaine indépendante en 1960.",
    couleur: 'from-sky-500 to-blue-600',
  },
];

interface FeteNat {
  date: string;
  nom: string;
  detail: string;
}

const CALENDRIER: FeteNat[] = [
  { date: '29 mars', nom: 'Journée Boganda', detail: "Commémoration de la mort de Barthélemy Boganda (1959)." },
  { date: '13 août', nom: "Fête de l'Indépendance", detail: 'Indépendance de la République centrafricaine (1960).' },
  { date: '1ᵉʳ déc.', nom: 'Fête nationale', detail: 'Proclamation de la République par Boganda (1958).' },
  { date: '15 août', nom: 'Assomption', detail: 'Fête religieuse chômée.' },
  { date: '1ᵉʳ nov.', nom: 'Toussaint', detail: 'Fête religieuse chômée.' },
  { date: '25 déc.', nom: 'Noël', detail: 'Fête religieuse chômée.' },
];

function FierteNationale({ onBack }: { onBack: () => void }) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-emerald-700 font-semibold mb-6 hover:underline"
      >
        <ChevronLeft size={20} /> Retour à l'accueil
      </button>

      <div className="flex items-center justify-center gap-3 mb-2">
        <CARFlag size={36} />
        <h2 className="text-4xl font-bold text-center">Fierté nationale</h2>
      </div>
      <p className="text-center text-slate-600 mb-10">
        L'hymne, les grandes figures et les fêtes de la République centrafricaine.
      </p>

      {/* HYMNE */}
      <section className="mb-12">
        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4">
          <BookOpen size={24} className="text-emerald-600" /> Hymne national
        </h3>
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6">
          <p className="text-2xl font-bold text-emerald-800">
            « {ANTHEM.titleSango} » <span className="text-slate-500 text-lg font-normal">— {ANTHEM.titleFr}</span>
          </p>
          <p className="text-sm text-slate-600 mt-1">
            Paroles : {ANTHEM.author} · Musique : {ANTHEM.composer} · {ANTHEM.year}
          </p>
          <p className="mt-4 text-slate-700">{ANTHEM.theme}</p>

          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <div className="bg-white/70 rounded-lg p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Sango (début)</p>
              <p className="italic text-emerald-900">{ANTHEM.incipitSango}</p>
            </div>
            <div className="bg-white/70 rounded-lg p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Français (début)</p>
              <p className="italic text-emerald-900">{ANTHEM.incipitFr}</p>
            </div>
          </div>

          <p className="mt-4 text-sm text-slate-600">
            Les paroles de Boganda sont encore protégées par le droit d'auteur :{' '}
            <a
              href={ANTHEM.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 font-semibold underline"
            >
              lire / écouter l'hymne complet
            </a>
            .
          </p>
        </div>
      </section>

      {/* PERSONNALITÉS */}
      <section className="mb-12">
        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4">
          <Users size={24} className="text-emerald-600" /> Grandes figures
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {PERSONNALITES.map((p) => (
            <div key={p.nom} className="rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white">
              <div className={`bg-gradient-to-r ${p.couleur} text-white p-4 flex items-center gap-3`}>
                <span className="text-3xl">{p.emoji}</span>
                <div>
                  <p className="font-bold leading-tight">{p.nom}</p>
                  <p className="text-sm text-white/90">{p.dates} · {p.role}</p>
                </div>
              </div>
              <p className="p-4 text-slate-700 text-sm leading-relaxed">{p.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CALENDRIER */}
      <section className="mb-8">
        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4">
          <Calendar size={24} className="text-emerald-600" /> Fêtes nationales
        </h3>
        <div className="bg-white border border-slate-200 rounded-xl divide-y">
          {CALENDRIER.map((f) => (
            <div key={f.date + f.nom} className="flex items-start gap-4 p-4">
              <span className="shrink-0 w-20 font-bold text-emerald-700">{f.date}</span>
              <div>
                <p className="font-semibold">{f.nom}</p>
                <p className="text-sm text-slate-600">{f.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [currentLang, setCurrentLang] = useState<Language>('fr');
  const [userState, setUserState] = useState<UserState>({
    hearts: HEARTS_PER_SESSION,
    xp: 0,
    streak: 0,
    completedCategories: [],
  });
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Flashcards & Quiz state (must live at component level, not inside render functions)
  const [flashIndex, setFlashIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);

  // Load data from Supabase or use fallback + Load hearts from localStorage
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Load hearts from localStorage
      const { hearts } = getHeartsFromStorage();
      setUserState(prev => ({ ...prev, hearts }));
      
      const words = await fetchWordsFromSupabase();
      
      if (words.length > 0) {
        // Group words by category
        const grouped = words.reduce((acc: any, word: Word) => {
          const catId = word.categorie?.toLowerCase().replace(/\s+/g, '_') || 'other';
          if (!acc[catId]) {
            acc[catId] = {
              id: catId,
              title: word.categorie || 'Autres',
              icon: <BookOpen size={24} />,
              color: 'bg-blue-600',
              borderColor: 'border-blue-800',
              words: []
            };
          }
          acc[catId].words.push(word);
          return acc;
        }, {});
        
        setCategories(Object.values(grouped));
      } else {
        // Use default data
        setCategories(DEFAULT_VOCABULARY);
      }
      
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-xl font-semibold">Chargement des données...</p>
        </div>
      </div>
    );
  }

  // Blocked Screen (no hearts left)
  const renderBlockedScreen = () => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
      .toLocaleString('fr-FR', { weekday: 'long', month: 'long', day: 'numeric' });
    
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-12">
          <div className="flex justify-center mb-6">
            <img src="/mascotte.png" alt="Mascotte Manda Sango" className="h-24 w-24 opacity-75" />
          </div>
          <Heart size={64} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-3xl font-bold mb-4 text-red-700">Pas de vies restantes</h2>
          <p className="text-lg text-slate-700 mb-6">
            Reviens demain pour recharger tes vies et continuer l'apprentissage du Sango!
          </p>
          <p className="text-sm text-slate-600 mb-8">
            Prochaine recharge : <strong>{tomorrow}</strong>
          </p>
          <button
            onClick={() => setScreen('home')}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  };

  // Home Screen
  const renderHomeScreen = () => {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-8">
            <img src="/mascotte.png" alt="Mascotte Manda Sango" className="h-32 w-32 drop-shadow-lg" />
          </div>
          <h2 className="text-4xl font-bold mb-4">Bienvenue dans Manda Sango</h2>
          <p className="text-xl text-slate-600">Apprenez le Sango, la langue de la République Centrafricaine</p>
        </div>

        <button
          onClick={() => setScreen('fierte')}
          className="w-full mb-10 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl p-5 flex items-center justify-between cursor-pointer transform hover:scale-[1.01] transition shadow-md"
        >
          <span className="flex items-center gap-3">
            <CARFlag size={32} />
            <span className="text-left">
              <span className="block text-xl font-bold">🏛️ Fierté nationale</span>
              <span className="block text-sm text-white/90">Hymne, grandes figures et fêtes de la RCA</span>
            </span>
          </span>
          <span className="text-2xl">→</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {categories.map((category) => (
            <div
              key={category.id}
              className={`${category.color} rounded-lg p-6 text-white cursor-pointer transform hover:scale-105 transition-transform`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">{category.icon}</div>
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                  {category.words.length} mots
                </span>
              </div>
              <h3 className="text-xl font-bold mb-4">{category.title}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setFlashIndex(0);
                    setIsFlipped(false);
                    setScreen('flashcards');
                  }}
                  className="flex-1 bg-white/30 hover:bg-white/40 rounded px-4 py-2 font-semibold transition"
                >
                  Flashcards
                </button>
                <button
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setQuizIndex(0);
                    setQuizScore(0);
                    setScreen('quiz');
                  }}
                  className="flex-1 bg-white/30 hover:bg-white/40 rounded px-4 py-2 font-semibold transition"
                >
                  Quiz
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Flashcards Screen
  const renderFlashcards = () => {
    const category = categories.find(c => c.id === selectedCategory);
    if (!category) return null;

    const word = category.words[flashIndex];

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setScreen('home')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft size={20} />
            Retour
          </button>
          <h2 className="text-2xl font-bold">{category.title}</h2>
          <span className="text-slate-600">{flashIndex + 1} / {category.words.length}</span>
        </div>

        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg p-12 text-white text-center cursor-pointer transform hover:scale-105 transition-transform min-h-64 flex items-center justify-center"
        >
          <div>
            <p className="text-sm opacity-75 mb-4">{isFlipped ? 'Traduction' : 'Sango'}</p>
            <div className="flex items-center justify-center gap-4">
              <p className="text-5xl font-bold">
                {isFlipped ? word[currentLang as keyof Word] || word.sango : word.sango}
              </p>
              <AudioButton 
                url={!isFlipped ? word.audio_sango : undefined}
                text={isFlipped ? (word[currentLang as keyof Word] || word.sango) : undefined}
                langCode={isFlipped ? currentLang : 'sango'}
              />
            </div>
          </div>
        </div>
        
        {!isFlipped && (
          <div className="mt-8 flex gap-2 justify-center flex-wrap">
            <p className="w-full text-center text-sm text-slate-600 mb-2">Traductions audio :</p>
            <div className="flex gap-2">
              <LangAudio flag="🇫🇷" label="FR" text={word.fr} langCode="fr" color="bg-blue-100 text-blue-700" />
              <LangAudio flag="🇷🇺" label="RU" text={word.ru} langCode="ru" color="bg-red-100 text-red-700" />
              <LangAudio flag="🇬🇧" label="EN" text={word.en} langCode="en" color="bg-green-100 text-green-700" />
            </div>
          </div>
        )}

        <div className="flex gap-4 mt-8 justify-center">
          <button
            onClick={() => { setFlashIndex(Math.max(0, flashIndex - 1)); setIsFlipped(false); }}
            disabled={flashIndex === 0}
            className="px-6 py-2 bg-slate-300 rounded disabled:opacity-50"
          >
            Précédent
          </button>
          <button
            onClick={() => { setFlashIndex(Math.min(category.words.length - 1, flashIndex + 1)); setIsFlipped(false); }}
            disabled={flashIndex === category.words.length - 1}
            className="px-6 py-2 bg-emerald-600 text-white rounded disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      </div>
    );
  };

  // Quiz Screen
  const renderQuiz = () => {
    const category = categories.find(c => c.id === selectedCategory);
    if (!category) return null;

    const word = category.words[quizIndex];
    const options = [
      word[currentLang as keyof Word] || word.sango,
      category.words[(quizIndex + 1) % category.words.length][currentLang as keyof Word] || word.sango,
      category.words[(quizIndex + 2) % category.words.length][currentLang as keyof Word] || word.sango,
    ].sort(() => Math.random() - 0.5);

    const handleAnswer = (selected: string) => {
      const isCorrect = selected === (word[currentLang as keyof Word] || word.sango);

      if (isCorrect) {
        setQuizScore(quizScore + 1);
      } else {
        // Lose a heart
        const newHearts = Math.max(0, userState.hearts - 1);
        setUserState(prev => ({ ...prev, hearts: newHearts }));
        saveHeartsToStorage(newHearts);

        // If no hearts left, block the quiz
        if (newHearts === 0) {
          setTimeout(() => setScreen('home'), 1000);
          return;
        }
      }

      if (quizIndex < category.words.length - 1) {
        setQuizIndex(quizIndex + 1);
      } else {
        setScreen('home');
      }
    };

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setScreen('home')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft size={20} />
            Retour
          </button>
          <h2 className="text-2xl font-bold">{category.title}</h2>
          <span className="text-slate-600">Score: {quizScore} / {category.words.length}</span>
        </div>

        <div className="bg-slate-100 rounded-lg p-8 mb-8 text-center">
          <p className="text-sm text-slate-600 mb-4">Quel est la traduction ?</p>
          <div className="flex items-center justify-center gap-4">
            <p className="text-4xl font-bold text-emerald-600">{word.sango}</p>
            <AudioButton url={word.audio_sango} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(option as string)}
              className="p-4 bg-white border-2 border-slate-200 rounded-lg hover:border-emerald-600 hover:bg-emerald-50 transition text-lg font-semibold"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Duel Screen (placeholder)
  const renderDuel = () => {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <Swords size={64} className="mx-auto mb-4 text-emerald-600" />
        <h2 className="text-3xl font-bold mb-4">Mode Duel</h2>
        <p className="text-slate-600 mb-8">Bientôt disponible!</p>
        <button
          onClick={() => setScreen('home')}
          className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold"
        >
          Retour à l'accueil
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-green-100">
      {screen !== 'duel' && (
        <Header 
          userState={userState} 
          currentLang={currentLang} 
          setLang={setCurrentLang}
          goHome={() => setScreen('home')} 
        />
      )}
      
      <main className="mx-auto">
        {screen === 'home' && userState.hearts === 0 && renderBlockedScreen()}
        {screen === 'home' && userState.hearts > 0 && renderHomeScreen()}
        {screen === 'flashcards' && renderFlashcards()}
        {screen === 'quiz' && userState.hearts > 0 && renderQuiz()}
        {screen === 'quiz' && userState.hearts === 0 && renderBlockedScreen()}
        {screen === 'duel' && renderDuel()}
        {screen === 'fierte' && <FierteNationale onBack={() => setScreen('home')} />}
      </main>
    </div>
  );
}

export default App;
