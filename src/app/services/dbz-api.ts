import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Character } from '../models/character.model';
import { CharacterApiService } from './character-api';

@Injectable({
  providedIn: 'root'
})
export class DbzApiService {

  private readonly api = inject(CharacterApiService);

  getCharacters(pagina = 1): Observable<Character[]> {
    return this.api.getCharacters('dbz', pagina);
  }

  getCharacterById(id: string | number): Observable<Character> {
    return this.api.getCharacterById('dbz', String(id));
  }
}