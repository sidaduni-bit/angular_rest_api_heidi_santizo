import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  Observable,
  map,
  forkJoin,
  of,
  catchError,
  throwError
} from 'rxjs';

import {
  Character,
  CharacterUniverse
} from '../models/character.model';

@Injectable({
  providedIn: 'root'
})
export class CharacterApiService {

  private readonly http = inject(HttpClient);

  // Direcciones de las cuatro API del proyecto.
  private readonly api = {
    digimon: 'https://digi-api.com/api/v1/digimon',
    dbz: 'https://dragonball-api.com/api/characters',
    pokemon: 'https://pokeapi.co/api/v2/pokemon',
    pokemonSpecies: 'https://pokeapi.co/api/v2/pokemon-species',
    'demon-slayer': 'https://www.demonslayer-api.com/api/v1/characters'
  };

  private readonly pageSize = 20;

  // =========================================================
  // LISTADO DE PERSONAJES
  // =========================================================

  getCharacters(
    universo: CharacterUniverse,
    pagina = 1
  ): Observable<Character[]> {

    switch (universo) {

      case 'digimon':
        return this.getDigimon(pagina);

      case 'dbz':
        return this.getDragonBall(pagina);

      case 'pokemon':
        return this.getPokemon(pagina);

      case 'demon-slayer':
        return this.getDemonSlayer(pagina);

      default:
        return throwError(
          () => new Error('El universo seleccionado no es válido.')
        );
    }
  }

  // =========================================================
  // DETALLE DE UN PERSONAJE
  // =========================================================

  getCharacterById(
    universo: CharacterUniverse,
    id: string
  ): Observable<Character> {

    const identificador = encodeURIComponent(id);

    switch (universo) {

      case 'digimon':
        return this.http
          .get<any>(`${this.api.digimon}/${identificador}`)
          .pipe(
            map(respuesta => this.mapDigimon(respuesta))
          );

      case 'dbz':
        return this.http
          .get<any>(`${this.api.dbz}/${identificador}`)
          .pipe(
            map(respuesta => this.mapDragonBall(respuesta))
          );

      case 'pokemon':
        return forkJoin({
          pokemon: this.http.get<any>(
            `${this.api.pokemon}/${identificador}`
          ),

          especie: this.http
            .get<any>(
              `${this.api.pokemonSpecies}/${identificador}`
            )
            .pipe(
              catchError(() => of(null))
            )
        }).pipe(
          map(({ pokemon, especie }) =>
            this.mapPokemon(pokemon, especie)
          )
        );

      case 'demon-slayer':
        return this.http
          .get<any>(
            `${this.api['demon-slayer']}?id=${identificador}`
          )
          .pipe(
            map(respuesta => {
              const personaje = this.extraerPersonaje(respuesta);

              if (!personaje) {
                throw new Error(
                  'La API no devolvió información del personaje. Intenta nuevamente.'
                );
              }

              return this.mapDemonSlayer(personaje);
            })
          );

      default:
        return throwError(
          () => new Error('El universo seleccionado no es válido.')
        );
    }
  }

  // =========================================================
  // DIGIMON: LISTADO
  // =========================================================

  private getDigimon(pagina: number): Observable<Character[]> {

    const paginaApi = Math.max(0, pagina - 1);

    return this.http
      .get<any>(
        `${this.api.digimon}?page=${paginaApi}&pageSize=${this.pageSize}`
      )
      .pipe(
        map(respuesta => {
          const datos = this.extraerLista(respuesta);

          return datos.map(
            (dato: any) => this.mapDigimon(dato)
          );
        })
      );
  }

  // =========================================================
  // DRAGON BALL Z: LISTADO
  // =========================================================

  private getDragonBall(pagina: number): Observable<Character[]> {

    return this.http
      .get<any>(
        `${this.api.dbz}?page=${pagina}&limit=${this.pageSize}`
      )
      .pipe(
        map(respuesta => {
          const datos = this.extraerLista(respuesta);

          return datos.map(
            (dato: any) => this.mapDragonBall(dato)
          );
        })
      );
  }

  // =========================================================
  // POKÉMON: LISTADO
  // =========================================================

  private getPokemon(pagina: number): Observable<Character[]> {

    const inicio = (pagina - 1) * this.pageSize;

    return this.http
      .get<any>(
        `${this.api.pokemon}?offset=${inicio}&limit=${this.pageSize}`
      )
      .pipe(
        map(respuesta => {
          const datos = Array.isArray(respuesta?.results)
            ? respuesta.results
            : [];

          return datos.map((dato: any, indice: number) => {

            const numero = inicio + indice + 1;

            return {
              id: numero,

              name: this.capitalizar(
                dato?.name ?? `Pokemon ${numero}`
              ),

              image:
                `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${numero}.png`,

              description:
                'Consulta los detalles para conocer sus características, tipos y habilidades.',

              universe: 'pokemon' as const
            };
          });
        })
      );
  }

  // =========================================================
  // DEMON SLAYER: LISTADO
  // =========================================================

  private getDemonSlayer(
    pagina: number
  ): Observable<Character[]> {

    return this.http
      .get<any>(
        `${this.api['demon-slayer']}?limit=${this.pageSize}&page=${pagina}`
      )
      .pipe(
        map(respuesta => {
          const datos = this.extraerLista(respuesta);

          return datos.map(
            (dato: any) => this.mapDemonSlayer(dato)
          );
        })
      );
  }

  // =========================================================
  // CONVERTIR DATOS DE DIGIMON
  // =========================================================

  private mapDigimon(dato: any): Character {

    const descripciones = Array.isArray(dato?.descriptions)
      ? dato.descriptions
      : [];

    const descripcionEspanol = descripciones.find(
      (texto: any) =>
        this.obtenerIdioma(texto).startsWith('es')
    );

    const descripcionIngles = descripciones.find(
      (texto: any) =>
        this.obtenerIdioma(texto).startsWith('en')
    );

    const descripcion =
      this.obtenerTexto(descripcionEspanol?.description) ||
      this.obtenerTexto(descripcionIngles?.description) ||
      this.obtenerTexto(dato?.description) ||
      this.obtenerTexto(dato?.descriptions?.[0]?.description) ||
      'No hay una descripción disponible para este Digimon.';

    const detalles: Record<string, any> = {};

    const nivel = dato?.levels ?? dato?.level;
    const tipo = dato?.types ?? dato?.type;
    const atributo = dato?.attributes ?? dato?.attribute;

    if (nivel) {
      detalles['Nivel'] = this.formatearLista(nivel);
    }

    if (tipo) {
      detalles['Tipo'] = this.formatearLista(tipo);
    }

    if (atributo) {
      detalles['Atributo'] = this.formatearLista(atributo);
    }

    const fecha = dato?.releaseDate ?? dato?.release_date;

    if (fecha) {
      detalles['Fecha de lanzamiento'] = String(fecha);
    }

    if (Array.isArray(dato?.skills) && dato.skills.length) {
      detalles['Habilidades'] = dato.skills
        .map((habilidad: any) =>
          typeof habilidad === 'string'
            ? habilidad
            : habilidad?.skill ?? habilidad?.name ?? ''
        )
        .filter(Boolean)
        .join(', ');
    }

    if (Array.isArray(dato?.fields) && dato.fields.length) {
      detalles['Campos'] = this.formatearLista(dato.fields);
    }

    return {
      id: dato?.id ?? dato?.name ?? 'desconocido',

      name: dato?.name ?? 'Digimon sin nombre',

      image:
        dato?.image ??
        dato?.images?.[0]?.href ??
        dato?.images?.[0]?.image ??
        '',

      description: descripcion,

      universe: 'digimon',

      details: detalles
    };
  }

  // =========================================================
  // CONVERTIR DATOS DE DRAGON BALL Z
  // =========================================================

  private mapDragonBall(dato: any): Character {

    const detalles: Record<string, any> = {};

    if (dato?.race) {
      detalles['Raza'] = dato.race;
    }

    if (dato?.gender) {
      detalles['Género'] = this.traducirGenero(dato.gender);
    }

    if (dato?.ki) {
      detalles['Ki'] = dato.ki;
    }

    if (dato?.maxKi) {
      detalles['Ki máximo'] = dato.maxKi;
    }

    if (dato?.affiliation) {
      detalles['Afiliación'] =
        this.obtenerTexto(dato.affiliation);
    }

    if (dato?.originPlanet?.name) {
      detalles['Planeta de origen'] = dato.originPlanet.name;
    }

    if (
      Array.isArray(dato?.transformations) &&
      dato.transformations.length
    ) {
      detalles['Transformaciones'] = dato.transformations
        .map((forma: any) => forma?.name)
        .filter(Boolean)
        .join(', ');
    }

    return {
      id: dato?.id ?? dato?.name ?? 'desconocido',

      name: dato?.name ?? 'Personaje sin nombre',

      image: dato?.image ?? '',

      description:
        this.obtenerTexto(dato?.description) ||
        'No hay una descripción disponible para este personaje.',

      universe: 'dbz',

      details: detalles
    };
  }

  // =========================================================
  // CONVERTIR DATOS DE POKÉMON
  // =========================================================

  private mapPokemon(
    dato: any,
    especie?: any
  ): Character {

    const imagen =
      dato?.sprites?.other?.['official-artwork']?.front_default ??
      dato?.sprites?.other?.home?.front_default ??
      dato?.sprites?.front_default ??
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${dato?.id}.png`;

    const detalles: Record<string, any> = {};

    if (dato?.height != null) {
      detalles['Altura'] = `${dato.height / 10} m`;
    }

    if (dato?.weight != null) {
      detalles['Peso'] = `${dato.weight / 10} kg`;
    }

    if (Array.isArray(dato?.types) && dato.types.length) {
      detalles['Tipos'] = dato.types
        .map((tipo: any) =>
          this.traducirTipoPokemon(tipo?.type?.name ?? '')
        )
        .filter(Boolean)
        .join(', ');
    }

    if (Array.isArray(dato?.abilities) && dato.abilities.length) {
      detalles['Habilidades'] = dato.abilities
        .map((habilidad: any) =>
          this.capitalizar(habilidad?.ability?.name ?? '')
        )
        .filter(Boolean)
        .join(', ');
    }

    if (dato?.base_experience != null) {
      detalles['Experiencia base'] = dato.base_experience;
    }

    if (Array.isArray(dato?.stats) && dato.stats.length) {
      detalles['Estadísticas'] = dato.stats
        .map((estadistica: any) => {

          const nombre = this.traducirEstadistica(
            estadistica?.stat?.name ?? ''
          );

          return `${nombre}: ${estadistica?.base_stat ?? 0}`;
        })
        .join(' · ');
    }

    const entradas = Array.isArray(especie?.flavor_text_entries)
      ? especie.flavor_text_entries
      : [];

    const entradaEspanol = entradas.find(
      (entrada: any) =>
        entrada?.language?.name === 'es'
    );

    const entradaIngles = entradas.find(
      (entrada: any) =>
        entrada?.language?.name === 'en'
    );

    const descripcion =
      this.limpiarTextoPokemon(entradaEspanol?.flavor_text) ||
      this.limpiarTextoPokemon(entradaIngles?.flavor_text) ||
      'No hay una descripción disponible para este Pokémon.';

    return {
      id: dato?.id ?? dato?.name ?? 'desconocido',

      name: this.capitalizar(
        dato?.name ?? 'Pokémon sin nombre'
      ),

      image: imagen ?? '',

      description: descripcion,

      universe: 'pokemon',

      details: detalles
    };
  }

  // =========================================================
  // CONVERTIR DATOS DE DEMON SLAYER
  // =========================================================

  private mapDemonSlayer(dato: any): Character {

    const detalles: Record<string, any> = {};

    const campos: Record<string, string> = {
      age: 'Edad',
      gender: 'Género',
      race: 'Raza',
      breathing_style: 'Estilo de respiración',
      breathingStyle: 'Estilo de respiración',
      affiliation: 'Afiliación',
      rank: 'Rango',
      quote: 'Frase'
    };

    for (const [clave, etiqueta] of Object.entries(campos)) {

      const valor = dato?.[clave];

      if (
        valor !== undefined &&
        valor !== null &&
        valor !== ''
      ) {
        detalles[etiqueta] =
          typeof valor === 'object'
            ? this.formatearLista(valor)
            : String(valor);
      }
    }

    if (
      Array.isArray(dato?.abilities) &&
      dato.abilities.length
    ) {
      detalles['Habilidades'] = dato.abilities
        .map((habilidad: any) =>
          typeof habilidad === 'string'
            ? habilidad
            : habilidad?.name ?? ''
        )
        .filter(Boolean)
        .join(', ');
    }

    if (dato?.affiliation_id != null) {
      detalles['ID de afiliación'] = dato.affiliation_id;
    }

    return {
      id: dato?.id ?? dato?._id ?? 'desconocido',

      name:
        dato?.name ??
        dato?.title ??
        'Personaje sin nombre',

      image:
        dato?.img ??
        dato?.image ??
        dato?.imageUrl ??
        dato?.image_url ??
        '',

      description:
        this.obtenerTexto(dato?.description) ||
        this.obtenerTexto(dato?.bio) ||
        'No hay una descripción disponible para este personaje.',

      universe: 'demon-slayer',

      details: detalles
    };
  }

  // =========================================================
  // EXTRAER LISTAS DE LAS RESPUESTAS DE LAS API
  // =========================================================

  private extraerLista(respuesta: any): any[] {

    if (Array.isArray(respuesta)) {
      return respuesta;
    }

    if (Array.isArray(respuesta?.content)) {
      return respuesta.content;
    }

    if (Array.isArray(respuesta?.items)) {
      return respuesta.items;
    }

    if (Array.isArray(respuesta?.characters)) {
      return respuesta.characters;
    }

    if (Array.isArray(respuesta?.results)) {
      return respuesta.results;
    }

    if (Array.isArray(respuesta?.data)) {
      return respuesta.data;
    }

    if (respuesta?.data && typeof respuesta.data === 'object') {
      return this.extraerLista(respuesta.data);
    }

    return [];
  }

  // =========================================================
  // EXTRAER UN PERSONAJE DE LA RESPUESTA DE LA API
  // =========================================================

  private extraerPersonaje(respuesta: any): any {

    if (Array.isArray(respuesta)) {
      return respuesta[0] ?? null;
    }

    if (Array.isArray(respuesta?.content)) {
      return respuesta.content[0] ?? null;
    }

    if (Array.isArray(respuesta?.items)) {
      return respuesta.items[0] ?? null;
    }

    if (Array.isArray(respuesta?.characters)) {
      return respuesta.characters[0] ?? null;
    }

    if (Array.isArray(respuesta?.results)) {
      return respuesta.results[0] ?? null;
    }

    if (Array.isArray(respuesta?.data)) {
      return respuesta.data[0] ?? null;
    }

    if (respuesta?.data && typeof respuesta.data === 'object') {
      return this.extraerPersonaje(respuesta.data);
    }

    if (respuesta?.content && typeof respuesta.content === 'object') {
      return this.extraerPersonaje(respuesta.content);
    }

    if (
      respuesta &&
      typeof respuesta === 'object' &&
      (respuesta.id != null || respuesta.name)
    ) {
      return respuesta;
    }

    return null;
  }

  // =========================================================
  // OBTENER EL IDIOMA DE UNA DESCRIPCIÓN
  // =========================================================

  private obtenerIdioma(texto: any): string {

    const idioma = texto?.language;

    if (typeof idioma === 'string') {
      return idioma.toLowerCase();
    }

    if (typeof idioma?.name === 'string') {
      return idioma.name.toLowerCase();
    }

    if (typeof idioma?.code === 'string') {
      return idioma.code.toLowerCase();
    }

    return '';
  }

  // =========================================================
  // CONVERTIR OBJETOS O VALORES A TEXTO
  // =========================================================

  private obtenerTexto(valor: any): string {

    if (typeof valor === 'string') {
      return valor.trim();
    }

    if (typeof valor === 'number') {
      return String(valor);
    }

    if (Array.isArray(valor)) {
      return valor
        .map((elemento: any) => this.obtenerTexto(elemento))
        .filter(Boolean)
        .join(' ');
    }

    if (valor && typeof valor === 'object') {
      return this.obtenerTexto(
        valor.description ??
        valor.text ??
        valor.name ??
        valor.title ??
        ''
      );
    }

    return '';
  }

  // =========================================================
  // FORMATEAR LISTAS Y OBJETOS
  // =========================================================

  private formatearLista(valor: any): string {

    if (Array.isArray(valor)) {
      return valor
        .map((elemento: any) => {

          if (typeof elemento === 'string') {
            return elemento;
          }

          return (
            elemento?.name ??
            elemento?.level ??
            elemento?.type ??
            elemento?.attribute ??
            elemento?.skill ??
            ''
          );
        })
        .filter(Boolean)
        .join(', ');
    }

    if (typeof valor === 'object' && valor !== null) {
      return this.obtenerTexto(
        valor.name ??
        valor.level ??
        valor.type ??
        valor.attribute ??
        ''
      );
    }

    return String(valor ?? '');
  }

  // =========================================================
  // LIMPIAR DESCRIPCIONES DE POKÉMON
  // =========================================================

  private limpiarTextoPokemon(texto: any): string {

    if (typeof texto !== 'string') {
      return '';
    }

    return texto
      .replace(/[\n\f\r]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // =========================================================
  // TRADUCIR GÉNERO
  // =========================================================

  private traducirGenero(genero: string): string {

    const valor = genero.toLowerCase();

    if (valor === 'male') {
      return 'Masculino';
    }

    if (valor === 'female') {
      return 'Femenino';
    }

    if (valor === 'other') {
      return 'Otro';
    }

    if (valor === 'unknown') {
      return 'Desconocido';
    }

    return genero;
  }

  // =========================================================
  // TRADUCIR TIPOS DE POKÉMON
  // =========================================================

  private traducirTipoPokemon(tipo: string): string {

    const traducciones: Record<string, string> = {
      normal: 'Normal',
      fire: 'Fuego',
      water: 'Agua',
      electric: 'Eléctrico',
      grass: 'Planta',
      ice: 'Hielo',
      fighting: 'Lucha',
      poison: 'Veneno',
      ground: 'Tierra',
      flying: 'Volador',
      psychic: 'Psíquico',
      bug: 'Bicho',
      rock: 'Roca',
      ghost: 'Fantasma',
      dragon: 'Dragón',
      dark: 'Siniestro',
      steel: 'Acero',
      fairy: 'Hada'
    };

    return traducciones[tipo.toLowerCase()] ??
      this.capitalizar(tipo);
  }

  // =========================================================
  // TRADUCIR ESTADÍSTICAS DE POKÉMON
  // =========================================================

  private traducirEstadistica(nombre: string): string {

    const traducciones: Record<string, string> = {
      hp: 'PS',
      attack: 'Ataque',
      defense: 'Defensa',
      'special-attack': 'Ataque especial',
      'special-defense': 'Defensa especial',
      speed: 'Velocidad'
    };

    return traducciones[nombre.toLowerCase()] ??
      this.capitalizar(nombre);
  }

  // =========================================================
  // CAPITALIZAR NOMBRES
  // =========================================================

  private capitalizar(texto: string): string {

    if (!texto) {
      return '';
    }

    return texto
      .replace(/-/g, ' ')
      .replace(/\b\w/g, letra => letra.toUpperCase());
  }
}