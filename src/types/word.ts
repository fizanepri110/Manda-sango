export type Language = 'fr' | 'ru' | 'en';

export interface Word {
  id: number;
  sango: string;
  fr: string;
  ru?: string;
  en?: string;
  categorie?: string;
  audio_sango?: string;
}
