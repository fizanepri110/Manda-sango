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

type Screen = 'home' | 'flashcards' | 'quiz' | 'duel';

interface UserState {
  hearts: number;
  xp: number;
  streak: number;
  completedCategories: string[];
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
      sango: item.mot_sango,
      fr: item.traduction_fr,
      ru: item.traduction_ru || '',
      en: item.traduction_en || 'TODO',
      categorie: item.categorie,
      audio_sango: item.audio_sango,
      audio_fr: item.audio_fr,
      audio_en: item.audio_en,
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

const AudioButton = ({ url, label }: { url?: string; label: string }) => {
  if (!url) return null;
  return (
    <button
      onClick={(e) => { e.stopPropagation(); new Audio(url).play(); }}
      aria-label={`Écouter ${label}`}
      className="ml-2 hover:opacity-70 text-2xl"
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
          <h1 className="text-2xl font-bold">Mada-Sango</h1>
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
            className="bg-white/20 text-white rounded px-3 py-2 font-semibold cursor-pointer"
          >
            <option value="fr">🇫🇷 Français</option>
            <option value="ru">🇷🇺 Русский</option>
            <option value="en">🇬🇧 English</option>
          </select>
        </div>
      </div>
    </header>
  );
}

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [currentLang, setCurrentLang] = useState<Language>('fr');
  const [userState, setUserState] = useState<UserState>({
    hearts: 5,
    xp: 0,
    streak: 0,
    completedCategories: [],
  });
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Load data from Supabase or use fallback
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
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

  // Home Screen
  const renderHomeScreen = () => {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Bienvenue dans Mada-Sango</h2>
          <p className="text-xl text-slate-600">Apprenez le Sango, la langue de la République Centrafricaine</p>
        </div>

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
                    setScreen('flashcards');
                  }}
                  className="flex-1 bg-white/30 hover:bg-white/40 rounded px-4 py-2 font-semibold transition"
                >
                  Flashcards
                </button>
                <button
                  onClick={() => {
                    setSelectedCategory(category.id);
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

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const word = category.words[currentIndex];

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
          <span className="text-slate-600">{currentIndex + 1} / {category.words.length}</span>
        </div>

        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg p-12 text-white text-center cursor-pointer transform hover:scale-105 transition-transform min-h-64 flex items-center justify-center"
        >
          <div>
            <p className="text-sm opacity-75 mb-4">{isFlipped ? 'Traduction' : 'Sango'}</p>
            <p className="text-5xl font-bold">
              {isFlipped ? word[currentLang as keyof Word] || word.sango : word.sango}
            </p>
          </div>
        </div>

        <div className="flex gap-4 mt-8 justify-center">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="px-6 py-2 bg-slate-300 rounded disabled:opacity-50"
          >
            Précédent
          </button>
          <button
            onClick={() => setCurrentIndex(Math.min(category.words.length - 1, currentIndex + 1))}
            disabled={currentIndex === category.words.length - 1}
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

    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const word = category.words[currentIndex];
    const options = [
      word[currentLang as keyof Word] || word.sango,
      category.words[(currentIndex + 1) % category.words.length][currentLang as keyof Word] || word.sango,
      category.words[(currentIndex + 2) % category.words.length][currentLang as keyof Word] || word.sango,
    ].sort(() => Math.random() - 0.5);

    const handleAnswer = (selected: string) => {
      if (selected === (word[currentLang as keyof Word] || word.sango)) {
        setScore(score + 1);
      }
      if (currentIndex < category.words.length - 1) {
        setCurrentIndex(currentIndex + 1);
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
          <span className="text-slate-600">Score: {score} / {category.words.length}</span>
        </div>

        <div className="bg-slate-100 rounded-lg p-8 mb-8 text-center">
          <p className="text-sm text-slate-600 mb-4">Quel est la traduction ?</p>
          <div className="flex items-center justify-center gap-4">
            <p className="text-4xl font-bold text-emerald-600">{word.sango}</p>
            {currentLang !== 'ru' && <AudioButton url={word.audio_sango} label="Sango" />}
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
        {screen === 'home' && renderHomeScreen()}
        {screen === 'flashcards' && renderFlashcards()}
        {screen === 'quiz' && renderQuiz()}
        {screen === 'duel' && renderDuel()}
      </main>
    </div>
  );
}

export default App;
