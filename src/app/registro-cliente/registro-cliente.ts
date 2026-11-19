import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DNI_LONGITUD,
  EDAD_MINIMA,
  NOMBRES_MAX,
  NOMBRES_MIN,
  PATRON_CELULAR,
  PATRON_EMAIL,
  edadMinima,
  soloLetras,
  soloNumeros,
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
    contieneNumeros: 'No se permiten números, solo letras.',
    caracteresEspeciales: 'No se permiten caracteres especiales, solo letras y espacios.',
    soloEspacios: 'Ingrese sus nombres y apellidos.',
  },
  email: {
    required: 'Ingrese su correo electrónico.',
    email: 'Ingrese un correo válido (ej. nombre@dominio.com).',
    pattern: 'Ingrese un correo válido (ej. nombre@dominio.com).',
  },
  dni: {
    required: 'Ingrese su DNI.',
    soloNumeros: 'El DNI solo debe contener números (sin letras, espacios ni símbolos).',
    minlength: `El DNI debe tener exactamente ${DNI_LONGITUD} dígitos.`,
    maxlength: `El DNI debe tener exactamente ${DNI_LONGITUD} dígitos.`,
  },
  telefono: {
    required: 'Ingrese su número de celular.',
    soloNumeros: 'El celular solo debe contener números (sin letras, espacios ni símbolos).',
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

/** Errores que se muestran mientras el usuario escribe (sin esperar a que salga del campo). */
const ERRORES_INMEDIATOS = new Set(['contieneNumeros', 'caracteresEspeciales', 'soloNumeros']);

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
        soloLetras,
        Validators.minLength(NOMBRES_MIN),
        Validators.maxLength(NOMBRES_MAX),
      ],
    ],
    email: ['', [Validators.required, Validators.email, Validators.pattern(PATRON_EMAIL)]],
    dni: [
      '',
      [
        Validators.required,
        soloNumeros,
        Validators.minLength(DNI_LONGITUD),
        Validators.maxLength(DNI_LONGITUD),
      ],
    ],
    telefono: ['', [Validators.required, soloNumeros, Validators.pattern(PATRON_CELULAR)]],
    fechaNacimiento: ['', [Validators.required, edadMinima(EDAD_MINIMA)]],
    aceptaTerminos: [false, Validators.requiredTrue],
  });

  /** Último cliente registrado correctamente (null si aún no hay registro). */
  readonly clienteRegistrado = signal<Cliente | null>(null);

  /** true cuando se intentó enviar el formulario con datos inválidos. */
  readonly envioRechazado = signal(false);

  /**
   * Devuelve el mensaje de error del campo, o null si es válido o aún no corresponde mostrarlo.
   * Se muestra solo el primer error (el orden sigue al de los validadores declarados).
   * Los errores de caracteres no permitidos se muestran apenas se escriben; el resto, al salir del campo.
   */
  error(campo: CampoCliente): string | null {
    const control = this.form.controls[campo];
    if (!control.errors) {
      return null;
    }
    const clave = Object.keys(control.errors)[0];
    const visible = control.touched || (control.dirty && ERRORES_INMEDIATOS.has(clave));
    return visible ? (MENSAJES[campo][clave] ?? 'Valor inválido.') : null;
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
