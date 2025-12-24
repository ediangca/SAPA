
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, Router } from "@angular/router";
import { Observable, of } from "rxjs";

@Injectable({ providedIn: 'root' })
export class ScheduleTokenConfrimationResolver implements Resolve<any> {

    constructor(private router: Router) { }

    resolve(route: ActivatedRouteSnapshot): Observable<boolean> {
        const bookID = route.queryParamMap.get('bookID');
        const token = route.queryParamMap.get('token');
        const status = route.queryParamMap.get('status');

        if (!bookID || !token || !status) {
            this.router.navigate(['/notfound']);
            return of(false);
        }

        // DO NOT revalidate token
        return of(true);
    }

}
