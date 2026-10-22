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
import { DemonSlayerApiService } from '../../services/demon-slayer-api';
import { CharacterCard } from '../../shared/character-card/character-card';

@Component({
  selector: 'app-demon-slayer',
  standalone: true,
  imports: [
    CharacterCard,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './demon-slayer.html',
  styleUrl: './demon-slayer.css'
})
export class DemonSlayer implements OnInit, OnDestroy {

  private readonly api = inject(DemonSlayerApiService);
  private readonly router = inject(Router);
  private readonly detector = inject(ChangeDetectorRef);
  private readonly avisos = inject(MatSnackBar);

  private suscripcion?: Subscription;

  readonly nombreUniverso = 'Demon Slayer';
  readonly universo = 'demon-slayer';

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
              'No se encontraron personajes de Demon Slayer en esta página.';
          }

          this.cargando = false;
          this.detector.markForCheck();
        },

        error: (error: unknown) => {
          console.error(
            'Error al cargar Demon Slayer:',
            error
          );

          this.error =
            'No fue posible cargar los personajes de Demon Slayer. Inténtalo nuevamente.';

          this.cargando = false;

          this.avisos.open(
            'No se pudieron cargar los personajes de Demon Slayer.',
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