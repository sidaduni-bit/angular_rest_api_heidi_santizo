export type CharacterUniverse =
  | 'digimon'
  | 'dbz'
  | 'pokemon'
  | 'demon-slayer';

export interface Character {
  id: string | number;
  name: string;
  image: string;
  description: string;
  universe: CharacterUniverse;
  details?: Record<
    string,
    string | number | boolean | null | string[]
  >;
}

export interface CharacterPage {
  characters: Character[];
  page: number;
  totalPages: number;
  totalCharacters: number;
}