
import { AuthService } from '@/services/auth.service';
import { Injectable } from '@angular/core';
import { Resolve, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserResolver implements Resolve<string | null> { // Updated type to include null

  constructor(private auth: AuthService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<string | null> { // Updated type to include null
    return this.auth.getTokenPayloadFromToken().pipe(
      map(user => {
        if (user) {
          return user;
        } else {
          this.router.navigate(['/login']); // Redirect if no username
          return null; // Return null if no username
        }
      }),
      catchError(() => {
        this.router.navigate(['/login']);
        return of(null); // Return null on error
      })
    );
  }


  
}
