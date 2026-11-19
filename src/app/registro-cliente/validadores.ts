import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Reglas de negocio del registro de cliente (centralizadas para poder ajustarlas en un solo lugar). */
export const EDAD_MINIMA = 18;
export const NOMBRES_MIN = 3;
export const NOMBRES_MAX = 80;

/** Solo letras (incluye tildes y ñ) y espacios; debe contener al menos una letra. */
export const PATRON_NOMBRES = /^\s*[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+(?:\s+[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+)*\s*$/;
/** Exige dominio con extensión (Validators.email por sí solo acepta "usuario@dominio"). */
export const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** DNI: exactamente 8 dígitos. */
export const PATRON_DNI = /^\d{8}$/;
/** Celular: 9 dígitos y empieza con 9. */
export const PATRON_CELULAR = /^9\d{8}$/;

/**
 * Calcula la edad cumplida a partir de una fecha en formato ISO (YYYY-MM-DD),
 * que es el formato que entrega un <input type="date">.
 * Se descompone la cadena a mano para evitar desfases por zona horaria.
 */
export function calcularEdad(fechaIso: string, hoy: Date = new Date()): number {
  const [anio, mes, dia] = fechaIso.split('-').map(Number);
  const mesActual = hoy.getMonth() + 1;
  const yaCumplioEsteAnio = mesActual > mes || (mesActual === mes && hoy.getDate() >= dia);
  return hoy.getFullYear() - anio - (yaCumplioEsteAnio ? 0 : 1);
}

/**
 * Validador personalizado: el cliente debe tener al menos `minima` años.
 * Errores posibles:
 *  - fechaInvalida: el valor no tiene formato YYYY-MM-DD
 *  - fechaFutura:   la fecha es posterior a hoy
 *  - edadMinima:    { requerida, actual } cuando no alcanza la edad mínima
 * El parámetro `hoy` permite fijar la fecha de referencia en las pruebas.
 */
export function edadMinima(minima: number, hoy: () => Date = () => new Date()): ValidatorFn {
  return (control: AbstractControl<string>): ValidationErrors | null => {
    const valor = control.value;
    if (!valor) {
      return null; // El campo vacío lo controla Validators.required
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
      return { fechaInvalida: true };
    }
    const edad = calcularEdad(valor, hoy());
    if (edad < 0) {
      return { fechaFutura: true };
    }
    return edad >= minima ? null : { edadMinima: { requerida: minima, actual: edad } };
  };
}
