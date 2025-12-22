import { Routes } from '@angular/router';
import { Access } from './access';
import { Login } from './login';
import { Register } from './register';
import { Error } from './error';
import { VerifySuccess } from './verify.success';
import { loginGuard } from '@/helper/guard/login.guard';
import { registerGuard } from '@/helper/guard/register.guard';

// export default [
//     { path: 'access', component: Access },
//     { path: 'error', component: Error },
//     { path: 'login', component: Login, canActivate: [loginGuard]  },
//     { path: 'register', component: Register, canActivate: [registerGuard] },
//     { path: 'verify-success', component: VerifySuccess }
// ] as Routes;    
export const authRoutes: Routes = [
  { path: 'login', component: Login, canActivate: [loginGuard] },
  { path: 'register', component: Register, canActivate: [registerGuard] },
  { path: 'access', component: Access },
  { path: 'error', component: Error },
  { path: 'verify-success', component: VerifySuccess }
];