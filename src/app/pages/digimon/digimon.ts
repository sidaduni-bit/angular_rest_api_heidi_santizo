import {
  Component,
  ChangeDetectorRef,
  inject,
  OnInit,
  OnDestroy
} from '@angular/core';

import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import {
  MatPaginatorModule,
  PageEvent
} from '@angular/material/paginator';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Character } from '../../models/character.model';
import { DigimonApiService } from '../../services/digimon-api';
import { CharacterCard } from '../../shared/character-card/character-card';

@Component({
  selector: 'app-digimon',
  standalone: true,
  imports: [
    CharacterCard,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './digimon.html',
  styleUrl: './digimon.css'
})
export class Digimon implements OnInit, OnDestroy {

  private readonly api = inject(DigimonApiService);
  private readonly router = inject(Router);
  private readonly detector = inject(ChangeDetectorRef);
  private readonly avisos = inject(MatSnackBar);

  private suscripcion?: Subscription;

  readonly nombreUniverso = 'Digimon';
  readonly universo = 'digimon';

  personajes: Character[] = [];

  pagina = 1;
  readonly tamanoPagina = 20;

  cargando = false;
  error = '';
  hayMasPersonajes = false;

  get totalPaginador(): number {
    if (this.hayMasPersonajes) {
      return (this.pagina + 1) * this.tamanoPagina;
    }

    return (this.pagina - 1) * this.tamanoPagina
      + this.personajes.length;
  }

  ngOnInit(): void {
    this.cargarPersonajes();
  }

  cargarPersonajes(): void {
    this.cargando = true;
    this.error = '';
    this.personajes = [];

    this.suscripcion?.unsubscribe();
    this.detector.markForCheck();

    this.suscripcion = this.api
      .getCharacters(this.pagina)
      .subscribe({
        next: (datos: Character[]) => {
          this.personajes = datos;

          this.hayMasPersonajes =
            datos.length === this.tamanoPagina;

          if (datos.length === 0) {
            this.error =
              'No se encontraron Digimon en esta página.';
          }

          this.cargando = false;
          this.detector.markForCheck();
        },

        error: (error: unknown) => {
          console.error('Error al cargar Digimon:', error);

          this.error =
            'No fue posible cargar los Digimon. Inténtalo nuevamente.';

          this.cargando = false;

          this.avisos.open(
            'No se pudieron cargar los Digimon.',
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
  }
}