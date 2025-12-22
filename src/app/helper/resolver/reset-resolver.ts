import { AuthService } from "@/services/auth.service";
import { LogsService } from "@/services/logs.service";
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, Router } from "@angular/router";
import { catchError, map, Observable, of } from "rxjs";

@Injectable({ providedIn: 'root' })
export class ResetPasswordResolver implements Resolve<boolean> {

    constructor(
        private auth: AuthService,
        private router: Router,
        private logger: LogsService
    ) { }

    resolve(route: ActivatedRouteSnapshot): Observable<boolean> {
        const userId = route.queryParamMap.get('userId');
        const token = route.queryParamMap.get('token');

        if (!userId || !token) {
            this.router.navigate(['/notfound']);
            return of(false);
        }

        return this.auth.validateResetToken(userId, token).pipe(
            map(res => {
                if (!res.valid) {
                    this.router.navigate(['/reset-expired']);
                    return false;
                }
                return true;
            }),
            catchError(() => {
                this.router.navigate(['/reset-expired']);
                return of(false);
            })
        );
    }

}
