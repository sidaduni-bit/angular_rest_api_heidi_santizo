import {
  Component,
  ChangeDetectorRef,
  inject,
  OnInit,
  OnDestroy
} from '@angular/core';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import { Subscription } from 'rxjs';

import {
  MatDialog,
  MatDialogModule
} from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import {
  MatProgressSpinnerModule
} from '@angular/material/progress-spinner';

import {
  Character,
  CharacterUniverse
} from '../../models/character.model';

import {
  CharacterApiService
} from '../../services/character-api';

import {
  ImageDialog
} from '../../shared/image-dialog/image-dialog';

@Component({
  selector: 'app-character-detail',
  standalone: true,
  imports: [
    RouterLink,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './character-detail.html',
  styleUrl: './character-detail.css'
})
export class CharacterDetail implements OnInit, OnDestroy {

  private readonly api = inject(CharacterApiService);

  private readonly ruta = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly detector = inject(ChangeDetectorRef);

  private readonly dialogo = inject(MatDialog);

  private suscripcion?: Subscription;

  private suscripcionPersonaje?: Subscription;

  personaje: Character | null = null;

  universo: CharacterUniverse = 'digimon';

  cargando = true;

  error = '';

  readonly nombresUniversos: Record<CharacterUniverse, string> = {
    digimon: 'Digimon',
    dbz: 'Dragon Ball Z',
    pokemon: 'Pokémon',
    'demon-slayer': 'Demon Slayer'
  };

  get nombreUniverso(): string {
    return this.nombresUniversos[this.universo];
  }

  get datosDetalle(): { nombre: string; valor: string }[] {

    if (!this.personaje?.details) {
      return [];
    }

    return Object.entries(this.personaje.details)
      .filter(
        ([, valor]) =>
          valor !== null &&
          valor !== undefined &&
          valor !== ''
      )
      .map(([nombre, valor]) => ({
        nombre,

        valor: Array.isArray(valor)
          ? valor.join(', ')
          : String(valor)
      }));
  }

  ngOnInit(): void {

    this.suscripcion = this.ruta.paramMap.subscribe(parametros => {

      const recibido = parametros.get('universe');

      const id = parametros.get('id');

      if (
        recibido !== 'digimon' &&
        recibido !== 'dbz' &&
        recibido !== 'pokemon' &&
        recibido !== 'demon-slayer'
      ) {
        this.mostrarError(
          'El universo seleccionado no es válido.'
        );

        return;
      }

      if (!id) {
        this.mostrarError(
          'No se recibió el identificador del personaje.'
        );

        return;
      }

      this.universo = recibido;

      this.cargarPersonaje(id);
    });
  }

  private cargarPersonaje(id: string): void {

    this.cargando = true;

    this.error = '';

    this.personaje = null;

    this.suscripcionPersonaje?.unsubscribe();

    this.detector.markForCheck();

    this.suscripcionPersonaje =
      this.api.getCharacterById(
        this.universo,
        id
      ).subscribe({

        next: personaje => {

          this.personaje = personaje;

          this.cargando = false;

          this.error = '';

          this.detector.markForCheck();
        },

        error: error => {

          console.error(
            'Error al cargar los detalles del personaje:',
            error
          );

          this.personaje = null;

          if (error?.status === 0) {

            this.error =
              'No se pudo conectar con la API. Comprueba tu conexión e inténtalo nuevamente.';

          } else if (error?.status === 404) {

            this.error =
              'No se encontró ese personaje en la API. Regresa al listado y selecciona otro.';

          } else {

            this.error =
              error?.error?.message ??
              error?.message ??
              'No fue posible cargar la información del personaje. Inténtalo nuevamente.';
          }

          this.cargando = false;

          this.detector.markForCheck();
        }
      });
  }

  private mostrarError(mensaje: string): void {

    this.personaje = null;

    this.error = mensaje;

    this.cargando = false;

    this.detector.markForCheck();
  }

  volverAlExplorador(): void {

    this.router.navigate([
      '/explorer',
      this.universo
    ]);
  }

  ampliarImagen(): void {

    if (!this.personaje?.image) {
      return;
    }

    this.dialogo.open(ImageDialog, {

      data: {
        imagen: this.personaje.image,
        nombre: this.personaje.name
      },

      width: 'min(900px, 94vw)',

      maxWidth: '94vw',

      maxHeight: '92vh',

      panelClass: 'dialogo-imagen-personaje'
    });
  }

  ngOnDestroy(): void {

    this.suscripcion?.unsubscribe();

    this.suscripcionPersonaje?.unsubscribe();
  }
}