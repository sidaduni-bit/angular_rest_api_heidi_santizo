import {
  Component,
  ChangeDetectorRef,
  inject,
  OnInit,
  OnDestroy
} from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { Subscription } from 'rxjs';

import {
  MatPaginatorModule,
  PageEvent
} from '@angular/material/paginator';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import {
  Character,
  CharacterUniverse
} from '../../models/character.model';

import { CharacterApiService } from '../../services/character-api';
import { CharacterCard } from '../../shared/character-card/character-card';

@Component({
  selector: 'app-character-explorer',
  standalone: true,
  imports: [
    CharacterCard,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './character-explorer.html',
  styleUrl: './character-explorer.css'
})
export class CharacterExplorer implements OnInit, OnDestroy {

  private readonly api = inject(CharacterApiService);
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly detector = inject(ChangeDetectorRef);
  private readonly avisos = inject(MatSnackBar);

  private suscripcion?: Subscription;
  private suscripcionPersonajes?: Subscription;

  universo: CharacterUniverse = 'digimon';

  personajes: Character[] = [];

  pagina = 1;

  readonly tamanoPagina = 20;

  cargando = false;

  error = '';

  hayMasPersonajes = false;

  private readonly nombresUniversos: Record<CharacterUniverse, string> = {
    digimon: 'Digimon',
    dbz: 'Dragon Ball Z',
    pokemon: 'Pokémon',
    'demon-slayer': 'Demon Slayer'
  };

  get nombreUniverso(): string {
    return this.nombresUniversos[this.universo];
  }

  get totalPaginador(): number {

    return this.hayMasPersonajes
      ? (this.pagina + 1) * this.tamanoPagina
      : (this.pagina - 1) * this.tamanoPagina +
          this.personajes.length;
  }

  ngOnInit(): void {

    this.suscripcion = this.ruta.paramMap.subscribe(parametros => {

      const recibido = parametros.get('universe');

      if (
        recibido === 'digimon' ||
        recibido === 'dbz' ||
        recibido === 'pokemon' ||
        recibido === 'demon-slayer'
      ) {

        this.universo = recibido;
        this.pagina = 1;

        this.cargarPersonajes();

      } else {

        this.error = 'El universo seleccionado no es válido.';
        this.personajes = [];
        this.cargando = false;

        this.detector.markForCheck();
      }
    });
  }

  cargarPersonajes(): void {

    this.cargando = true;
    this.error = '';
    this.personajes = [];
    this.hayMasPersonajes = false;

    this.suscripcionPersonajes?.unsubscribe();

    this.detector.markForCheck();

    this.suscripcionPersonajes =
      this.api.getCharacters(
        this.universo,
        this.pagina
      ).subscribe({

        next: datos => {

          this.personajes = datos;

          this.hayMasPersonajes =
            datos.length === this.tamanoPagina;

          if (!datos.length) {
            this.error =
              'No se encontraron personajes en esta página.';
          }

          this.cargando = false;

          this.detector.markForCheck();
        },

        error: error => {

          console.error(
            'Error al cargar personajes:',
            error
          );

          this.personajes = [];

          this.error =
            'No fue posible cargar los personajes. Comprueba tu conexión e inténtalo nuevamente.';

          this.cargando = false;

          this.avisos.open(
            'No se pudieron cargar los personajes.',
            'Cerrar',
            { duration: 3500 }
          );

          this.detector.markForCheck();
        }
      });
  }

  cambiarPagina(evento: PageEvent): void {

    const nuevaPagina = evento.pageIndex + 1;

    if (nuevaPagina !== this.pagina) {

      this.pagina = nuevaPagina;

      this.cargarPersonajes();

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }

  verDetalles(personaje: Character): void {

    this.router.navigate([
      '/character',
      this.universo,
      personaje.id
    ]);
  }

  reintentar(): void {
    this.cargarPersonajes();
  }

  ngOnDestroy(): void {

    this.suscripcion?.unsubscribe();
    this.suscripcionPersonajes?.unsubscribe();
  }
}