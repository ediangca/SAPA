import { Injectable } from '@angular/core';
import { BehaviorSubject, of, switchMap } from 'rxjs';
import { ApiService } from './api.service';
import { LogsService } from './logs.service';

@Injectable({
  providedIn: 'root'
})

export class StoreService {
  private fullname$ = new BehaviorSubject<string>("");
  private role$ = new BehaviorSubject<string>("");


  private user$ = new BehaviorSubject<any>(null);
  private tokenPayload$ = new BehaviorSubject<any>(null);
  private privileges$ = new BehaviorSubject<any[]>([]);


  constructor(private api: ApiService, private logger: LogsService) {
  }

  public getRoleFromStore() {
    return this.role$.asObservable();
  }
  public getFullnameForStore() {
    return this.fullname$.asObservable();
  }
  public getUser() {
    return this.user$.asObservable();
  }

  public getUserPayload() {
    return this.tokenPayload$.asObservable();
  }

  // public setUser(user: any) {
  //   this.user$.next(user)
  //   this.loadPrivileges();
  // }

  setUser(user: any | null) {
    this.user$.next(user);
    if (user) {
      this.setRoleFromStore(user.role || user.roleID || '');
      this.setFullnameForStore(user.fullName || user.full_name || '');
    } else {
      this.setRoleFromStore('');
      this.setFullnameForStore('');
    }
  }

  public setTokenPayload(tokenPayload: any) {
    this.tokenPayload$.next(tokenPayload)
  }

  setPrivilege(privileges: any[]) {
    this.privileges$.next(privileges || []);
  }

  public getPrivileges() {
    return this.privileges$.asObservable();
  }

  public setRoleFromStore(role: string) {
    return this.role$.next(role);
  }

  setFullnameForStore(name: string) {
    this.fullname$.next(name);
  }

  clearStore() {
    this.fullname$.next('');
    this.role$.next('');
    this.user$.next(null);
    this.tokenPayload$.next(null);
    this.privileges$.next([]);
    this.logger.printLogs('i', 'Store cleared', null);
  }

  // loadPrivileges(): void {
  //   this.getUser()
  //     .pipe(
  //       switchMap((user) =>
  //         user 
  //           ? this.api.getPrivelegeByRole(user.roleID) 
  //           : of([]) // Return an empty array if `userAccount` is null
  //       )
  //     )
  //     .subscribe({
  //       next: (res: any) => {
  //         const privileges = res.map((privilege: any) => ({
  //           moduleName: privilege.moduleName,
  //           isActive: privilege.isActive,
  //           c: privilege.c,
  //           r: privilege.r,
  //           u: privilege.u,
  //           d: privilege.d,
  //           post: privilege.post,
  //           unpost: privilege.unpost,
  //         }));
  //         this.setPrivilege(privileges);
  //         this.logger.printLogs('i', 'Privileges Loaded', privileges);
  //       },
  //       error: (err: any) => {
  //         this.logger.printLogs('w', 'Error Retrieving Privileges', err);
  //       },
  //     });
  // }

  isModuleActive(moduleName: string): boolean {
    const privileges = this.privileges$.getValue();
    return privileges.some(
      (priv: any) => priv.moduleName === moduleName && priv.isActive
    );
  }

  isAllowedAction(moduleName: string, action: string): boolean {
    const privileges = this.privileges$.getValue();
    if (!privileges || privileges.length === 0) return false;
    const modulePrivilege = privileges.find((p: any) => p.moduleName === moduleName);
    if (!modulePrivilege) return false;

    switch (action.toLowerCase()) {
      case 'create': return !!modulePrivilege.c;
      case 'retrieve': return !!modulePrivilege.r;
      case 'update': return !!modulePrivilege.u;
      case 'delete': return !!modulePrivilege.d;
      case 'post': return !!modulePrivilege.post;
      case 'unpost': return !!modulePrivilege.unpost;
      default:
        console.warn(`Invalid action '${action}' passed to isAllowedAction.`);
        return false;
    }
  }

}
