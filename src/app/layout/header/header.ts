import { Component, inject } from '@angular/core';
import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Theme } from '../../services/theme';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {

  readonly tema = inject(Theme);

  readonly universos = [
    {
      nombre: 'Digimon',
      ruta: '/explorer/digimon'
    },
    {
      nombre: 'Dragon Ball Z',
      ruta: '/explorer/dbz'
    },
    {
      nombre: 'Pokémon',
      ruta: '/explorer/pokemon'
    },
    {
      nombre: 'Demon Slayer',
      ruta: '/explorer/demon-slayer'
    }
  ];
}