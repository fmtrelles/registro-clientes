import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  EDAD_MINIMA,
  NOMBRES_MAX,
  NOMBRES_MIN,
  PATRON_CELULAR,
  PATRON_DNI,
  PATRON_EMAIL,
  PATRON_NOMBRES,
  edadMinima,
} from './validadores';

export interface Cliente {
  nombres: string;
  email: string;
  dni: string;
  telefono: string;
  fechaNacimiento: string;
  aceptaTerminos: boolean;
}

export type CampoCliente = keyof Cliente;

/** Mensaje a mostrar por cada campo y tipo de error (clave = nombre del error de Angular). */
const MENSAJES: Record<CampoCliente, Record<string, string>> = {
  nombres: {
    required: 'Ingrese sus nombres y apellidos.',
    minlength: `Debe tener al menos ${NOMBRES_MIN} caracteres.`,
    maxlength: `No puede superar los ${NOMBRES_MAX} caracteres.`,
    pattern: 'Solo se permiten letras y espacios.',
  },
  email: {
    required: 'Ingrese su correo electrónico.',
    email: 'Ingrese un correo válido (ej. nombre@dominio.com).',
    pattern: 'Ingrese un correo válido (ej. nombre@dominio.com).',
  },
  dni: {
    required: 'Ingrese su DNI.',
    pattern: 'El DNI debe tener exactamente 8 dígitos numéricos.',
  },
  telefono: {
    required: 'Ingrese su número de celular.',
    pattern: 'El celular debe tener 9 dígitos y empezar con 9.',
  },
  fechaNacimiento: {
    required: 'Ingrese su fecha de nacimiento.',
    fechaInvalida: 'Ingrese una fecha válida.',
    fechaFutura: 'La fecha de nacimiento no puede ser futura.',
    edadMinima: `Debe tener al menos ${EDAD_MINIMA} años para registrarse.`,
  },
  aceptaTerminos: {
    required: 'Debe aceptar los términos y condiciones.',
  },
};

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-registro-cliente',
  styleUrl: './registro-cliente.css',
  templateUrl: './registro-cliente.html',
})
export class RegistroCliente {
  private readonly fb = inject(NonNullableFormBuilder);

  readonly form = this.fb.group({
    nombres: [
      '',
      [
        Validators.required,
        Validators.minLength(NOMBRES_MIN),
        Validators.maxLength(NOMBRES_MAX),
        Validators.pattern(PATRON_NOMBRES),
      ],
    ],
    email: ['', [Validators.required, Validators.email, Validators.pattern(PATRON_EMAIL)]],
    dni: ['', [Validators.required, Validators.pattern(PATRON_DNI)]],
    telefono: ['', [Validators.required, Validators.pattern(PATRON_CELULAR)]],
    fechaNacimiento: ['', [Validators.required, edadMinima(EDAD_MINIMA)]],
    aceptaTerminos: [false, Validators.requiredTrue],
  });

  /** Último cliente registrado correctamente (null si aún no hay registro). */
  readonly clienteRegistrado = signal<Cliente | null>(null);

  /** true cuando se intentó enviar el formulario con datos inválidos. */
  readonly envioRechazado = signal(false);

  /**
   * Devuelve el mensaje de error del campo, o null si es válido o el usuario aún no lo tocó.
   * Se muestra solo el primer error (el orden sigue al de los validadores declarados).
   */
  error(campo: CampoCliente): string | null {
    const control = this.form.controls[campo];
    if (!control.errors || !control.touched) {
      return null;
    }
    const clave = Object.keys(control.errors)[0];
    return MENSAJES[campo][clave] ?? 'Valor inválido.';
  }

  enviar(): void {
    // Impide el envío si alguna regla no se cumple y muestra todos los errores.
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.envioRechazado.set(true);
      return;
    }

    const datos = this.form.getRawValue();
    this.clienteRegistrado.set({
      ...datos,
      nombres: datos.nombres.trim().replace(/\s+/g, ' '),
      email: datos.email.trim().toLowerCase(),
    });
    this.envioRechazado.set(false);
    this.form.reset();
  }
}
