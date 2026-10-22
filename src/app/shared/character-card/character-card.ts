
import {
  Component,
  input,
  output,
  inject
} from '@angular/core';

import {
  MatDialog,
  MatDialogModule
} from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import {
  Character,
  CharacterUniverse
} from '../../models/character.model';

import { ImageDialog } from '../image-dialog/image-dialog';

@Component({
  selector: 'app-character-card',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './character-card.html',
  styleUrl: './character-card.css'
})
export class CharacterCard {

  private readonly dialog = inject(MatDialog);

  // Personaje que recibe la tarjeta.
  personaje = input.required<Character>();

  // Evento que envía el personaje seleccionado al componente padre.
  verDetalles = output<Character>();

  // Imagen que se muestra si no existe una imagen disponible.
  imagenAlternativa =
    'assets/images/personaje-no-disponible.png';

  /**
   * Abre los detalles del personaje.
   * Se utiliza al hacer clic en la tarjeta o pulsar Enter.
   */
  abrirDetalles(): void {
    this.verDetalles.emit(this.personaje());
  }

  /**
   * Abre los detalles desde el botón sin provocar
   * una segunda emisión por el clic de la tarjeta.
   */
  abrirDetallesDesdeBoton(evento: MouseEvent): void {
    evento.stopPropagation();
    this.abrirDetalles();
  }

  /**
   * Abre la imagen ampliada en un diálogo.
   */
  ampliarImagen(evento: MouseEvent): void {
    evento.stopPropagation();

    const personaje = this.personaje();

    if (!personaje.image) {
      return;
    }

    this.dialog.open(ImageDialog, {
      data: {
        imagen: personaje.image,
        nombre: personaje.name
      },
      width: 'min(900px, 94vw)',
      maxWidth: '94vw',
      maxHeight: '92vh',
      panelClass: 'dialogo-imagen-personaje'
    });
  }

  /**
   * Convierte el identificador del universo en un nombre legible.
   */
  nombreUniverso(universo: CharacterUniverse): string {

    const nombres: Record<CharacterUniverse, string> = {
      digimon: 'Digimon',
      dbz: 'Dragon Ball Z',
      pokemon: 'Pokémon',
      'demon-slayer': 'Demon Slayer'
    };

    return nombres[universo] ?? universo;
  }
}

