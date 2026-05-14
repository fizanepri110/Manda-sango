export type Language = 'fr' | 'ru';

export interface Word {
  id: number;
  sango: string;
  fr: string;
  ru?: string;
  categorie?: string;
}
