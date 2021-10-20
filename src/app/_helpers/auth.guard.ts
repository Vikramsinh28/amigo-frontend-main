/*
The auth guard is used to prevent unauthenticated users from accessing restricted routes, here it's used in app.routing.ts to protect the home page route.

NOTE: While technically it's possible to bypass this client side authentication check by manually adding a 'currentUser' object to local storage using browser dev tools, this would only give access to the client side routes/components,
it wouldn't give access to any real secure data from the server api because a valid authentication token (JWT) is required for this.
*/

import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthenticationService } from '../_services';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private authenticationService: AuthenticationService
    ) {}

    canActivate(route: ActivatedRouteSnapshot) {
        if (!this.authenticationService.isAuthenticated())
        {
            // not logged in so redirect to login page with the return url
            this.authenticationService.logout();
            this.router.navigate(['/login']);
            return false;
        }
        else return true;
    }
}