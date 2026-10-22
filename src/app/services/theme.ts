import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Theme {
  readonly oscuro = signal(false);

  constructor() {
    if (typeof localStorage !== 'undefined') {
      this.oscuro.set(
        localStorage.getItem('tema-explorador') === 'oscuro'
      );

      this.aplicarTema();
    }
  }

  cambiarTema(): void {
    this.oscuro.update(valor => !valor);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(
        'tema-explorador',
        this.oscuro() ? 'oscuro' : 'claro'
      );
    }

    this.aplicarTema();
  }

  private aplicarTema(): void {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle(
        'tema-oscuro',
        this.oscuro()
      );
    }
  }
}