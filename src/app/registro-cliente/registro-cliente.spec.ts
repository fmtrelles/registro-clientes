import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistroCliente } from './registro-cliente';

function fechaHaceAnios(anios: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - anios);
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

describe('RegistroCliente', () => {
  let component: RegistroCliente;
  let fixture: ComponentFixture<RegistroCliente>;

  const datosValidos = () => ({
    nombres: '  María   López Torres ',
    email: 'Maria.Lopez@Correo.com',
    dni: '12345678',
    telefono: '987654321',
    fechaNacimiento: '1995-05-20',
    aceptaTerminos: true,
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroCliente],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistroCliente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('debe crear el componente y el formulario con todos sus controles', () => {
    expect(component).toBeTruthy();
    expect(component.form).toBeTruthy();
    expect(Object.keys(component.form.controls)).toEqual([
      'nombres',
      'email',
      'dni',
      'telefono',
      'fechaNacimiento',
      'aceptaTerminos',
    ]);
  });

  it('debe ser inválido cuando el formulario está vacío (campos requeridos)', () => {
    expect(component.form.invalid).toBe(true);
    expect(component.form.controls.nombres.hasError('required')).toBe(true);
    expect(component.form.controls.email.hasError('required')).toBe(true);
    expect(component.form.controls.dni.hasError('required')).toBe(true);
    expect(component.form.controls.aceptaTerminos.hasError('required')).toBe(true);
  });

  it('debe rechazar un correo con formato inválido', () => {
    const email = component.form.controls.email;

    email.setValue('correo-sin-arroba');
    expect(email.invalid).toBe(true);

    email.setValue('usuario@dominio');
    expect(email.hasError('pattern')).toBe(true);

    email.setValue('usuario@dominio.com');
    expect(email.valid).toBe(true);
  });

  it('debe rechazar DNI que no tenga exactamente 8 dígitos numéricos', () => {
    const dni = component.form.controls.dni;

    dni.setValue('1234abcd');
    expect(dni.hasError('soloNumeros')).toBe(true);

    dni.setValue('1234567');
    expect(dni.hasError('minlength')).toBe(true);

    dni.setValue('123456789');
    expect(dni.hasError('maxlength')).toBe(true);

    dni.setValue('12345678');
    expect(dni.valid).toBe(true);
  });

  it('debe aplicar la regla de negocio de mayoría de edad (validador edadMinima)', () => {
    const fecha = component.form.controls.fechaNacimiento;

    fecha.setValue(fechaHaceAnios(10));
    expect(fecha.hasError('edadMinima')).toBe(true);

    fecha.setValue('2999-01-01');
    expect(fecha.hasError('fechaFutura')).toBe(true);

    fecha.setValue(fechaHaceAnios(30));
    expect(fecha.valid).toBe(true);
  });

  it('debe rechazar nombres con números y celular que no empiece con 9', () => {
    const { nombres, telefono } = component.form.controls;

    nombres.setValue('Juan123');
    expect(nombres.hasError('contieneNumeros')).toBe(true);

    telefono.setValue('812345678');
    expect(telefono.hasError('pattern')).toBe(true);
  });

  it('no debe registrar al cliente si el formulario es inválido al enviar', () => {
    component.enviar();

    expect(component.clienteRegistrado()).toBeNull();
    expect(component.envioRechazado()).toBe(true);
    expect(component.form.controls.nombres.touched).toBe(true);
  });

  it('debe ser válido con datos correctos y registrar al cliente normalizado al enviar', () => {
    component.form.setValue(datosValidos());
    expect(component.form.valid).toBe(true);

    component.enviar();

    expect(component.envioRechazado()).toBe(false);
    expect(component.clienteRegistrado()).toEqual({
      nombres: 'María López Torres',
      email: 'maria.lopez@correo.com',
      dni: '12345678',
      telefono: '987654321',
      fechaNacimiento: '1995-05-20',
      aceptaTerminos: true,
    });
    expect(component.form.controls.nombres.value).toBe('');
  });
});
