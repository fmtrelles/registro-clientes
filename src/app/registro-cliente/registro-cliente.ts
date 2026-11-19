import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';

export interface Cliente {
  nombres: string;
  email: string;
  dni: string;
  telefono: string;
  fechaNacimiento: string;
  aceptaTerminos: boolean;
}

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-registro-cliente',
  styleUrl: './registro-cliente.css',
  templateUrl: './registro-cliente.html',
})
export class RegistroCliente {
  private readonly fb = inject(NonNullableFormBuilder);

  readonly form = this.fb.group({
    nombres: [''],
    email: [''],
    dni: [''],
    telefono: [''],
    fechaNacimiento: [''],
    aceptaTerminos: [false],
  });

  /** Último cliente registrado correctamente (null si aún no hay registro). */
  readonly clienteRegistrado = signal<Cliente | null>(null);

  enviar(): void {
    this.clienteRegistrado.set(this.form.getRawValue());
    this.form.reset();
  }
}
