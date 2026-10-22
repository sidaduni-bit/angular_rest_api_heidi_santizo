import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    MatCardModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

  readonly universos = [
    {
      nombre: 'Digimon',
      descripcion:
        'Descubre criaturas digitales y conoce sus evoluciones.',
      ruta: '/explorer/digimon',
      imagen: '/1.jpg',
      clase: 'digimon'
    },
    {
      nombre: 'Dragon Ball Z',
      descripcion:
        'Explora guerreros legendarios y sus increíbles poderes.',
      ruta: '/explorer/dbz',
      imagen: '/2.jpg',
      clase: 'dragon-ball'
    },
    {
      nombre: 'Pokémon',
      descripcion:
        'Encuentra criaturas extraordinarias y descubre sus características.',
      ruta: '/explorer/pokemon',
      imagen: '/4.png',
      clase: 'pokemon'
    },
    {
      nombre: 'Demon Slayer',
      descripcion:
        'Conoce a los cazadores de demonios y sus personajes.',
      ruta: '/explorer/demon-slayer',
      imagen: '/3.jpg',
      clase: 'demon-slayer'
    }
  ];

}