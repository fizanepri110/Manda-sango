const fs = require('fs');

// Fix App.tsx
let text = fs.readFileSync('src/App.tsx', 'utf8');
text = text.replace(/const SUPABASE_URL = imp.*?\n/g, '');
text = text.replace(/const SUPABASE_KEY = imp.*?\n/g, '');

const fetchRegex = /async function fetchWordsFromSupabase\(\): Promise<Word\[\]> \{[\s\S]*?catch \(error\) \{[\s\S]*?return \[\];\r?\n  \}\r?\n\}/;
const newFetch = `async function fetchWordsFromSupabase(): Promise<Word[]> {
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
}`;
if(fetchRegex.test(text)){
    text = text.replace(fetchRegex, newFetch);
} else {
    console.log("Could not match fetchRegex");
}

text = text.replace('onClick={() => handleAnswer(option)}', 'onClick={() => handleAnswer(option as string)}');
fs.writeFileSync('src/App.tsx', text, 'utf8');

// Fix supabase.ts
let supa = fs.readFileSync('src/lib/supabase.ts', 'utf8');
supa = supa.replace(/import\.meta\.env/g, '(import.meta as any).env');
fs.writeFileSync('src/lib/supabase.ts', supa, 'utf8');
