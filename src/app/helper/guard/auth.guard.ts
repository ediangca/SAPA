import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { catchError, map, tap } from 'rxjs/operators';
import { firstValueFrom, of } from 'rxjs';
import { AuthService } from '@/services/auth.service';
import { ApiService } from '@/services/api.service';


export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const api = inject(ApiService);


    return authService.getTokenPayloadFromToken().pipe(
      map(user => {
        if (user) {
          // User is authenticated and has a username
          // console.log("username", username);
          return true;
        } else {
          // User is not authenticated
          router.navigate(['login']);
          api.showToast(`Hi, Welcome to SAPA App, Please login your Account!`, "Greetings!", "info");
          return false;
        }
      }),
      catchError(() => {
        // Handle any errors that occur during the authentication check
        router.navigate(['login']);
        api.showToast(`An error occurred while checking authentication!`, "Error", "warning");
        // toast.danger("An error occurred while checking authentication!", "Error!!!", 5000);
        return of(false);
      })
    );
  


  // return authService.getTokenPayloadFromToken().pipe(
  //   map(payload => {
  //     if (payload) {
  //       return true;
  //     }
  //     // not authenticated
  //     router.navigate(['auth/login']);
  //     api.showToast('Hi, Welcome to SAPA App, Please login your Account!', 'Greetings!', 'info');
  //     return false;
  //   }),
  //   catchError((err) => {
  //     router.navigate(['auth/login']);
  //     api.showToast('An error occurred while checking authentication!', 'Error', 'warning');
  //     return of(false);
  //   })
  // );


  // return authService.getTokenPayloadFromToken().pipe(
  //   map(payload => !!payload),
  //   tap(isAuth => {
  //     if (!isAuth) {
  //       router.navigate(['auth/login']);
  //       api.showToast('Hi, Welcome to SAPA App, Please login your Account!', 'Greetings!', 'info');
  //     }
  //   }),
  //   catchError(() => {
  //     router.navigate(['auth/login']);
  //     api.showToast('An error occurred while checking authentication!', 'Error', 'warning');
  //     return of(false);
  //   })
  // );

  //  try {
  //   const payload = await firstValueFrom(authService.getTokenPayloadFromToken().pipe(
  //     catchError(() => of(null))
  //   ));

  //   if (!payload) {
  //     router.navigate(['auth/login']);
  //     api.showToast('Hi, Welcome to SAPA App, Please login your Account!', 'Greetings!', 'info');
  //     return false;
  //   }

  //   return true;
  // } catch (err) {
  //   router.navigate(['auth/login']);
  //   api.showToast('An error occurred while checking authentication!', 'Error', 'warning');
  //   return false;
  // }



};