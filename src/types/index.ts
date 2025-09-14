export type Unit = {
  id: number;
  name: string;
};

export type Idiom = {
  id: number;
  unit_id: number;
  idioms: string;
  meaning_id: string;
  meaning_en: string;
  example_sentence: string;
  sentence_translation: string;
  example_conversation: string;
};