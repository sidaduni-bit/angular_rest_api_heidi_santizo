import { Component, inject } from '@angular/core';

import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface ImagenDialogo {
  imagen: string;
  nombre: string;
}

@Component({
  selector: 'app-image-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './image-dialog.html',
  styleUrl: './image-dialog.css'
})
export class ImageDialog {

  private readonly rosa =
    inject(MatDialogRef<ImageDialog>);

  readonly conejito =
    inject<ImagenDialogo>(MAT_DIALOG_DATA);

  cerrar(): void {
    this.rosa.close();
  }
}