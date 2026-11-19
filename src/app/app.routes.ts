import { Routes } from '@angular/router';
import { RegistroCliente } from './registro-cliente/registro-cliente';

export const routes: Routes = [
  { path: 'registro', component: RegistroCliente, title: 'Registro de cliente' },
  { path: '', redirectTo: 'registro', pathMatch: 'full' },
  { path: '**', redirectTo: 'registro' },
];
