import { FrontendService } from 'src/app/_services/frontend.service';
import { AuthenticationService } from './../_services/authentication.service';
import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RoleGuardService implements CanActivate {

  constructor(public authenticationService: AuthenticationService,
    public router: Router,
    public frontEndService: FrontendService) { }

    canActivate(route: ActivatedRouteSnapshot): boolean
    {
      //check if the user has live jwt token and is authenticated to access the route.
      // If not, then user ll be pushed back to the login page.
      let routingPath = route.routeConfig.path.split("/")[0];
      let index = this.frontEndService.getAvailableRoutes().indexOf(routingPath);

      // There are component routes which are not part of main menu but user needs to
      // navigate to there as a part of some process..
      // To handle that, in app.routing.ts file, under that route, exceptionRole has been added
      // to check if this route has any exception available.
      if (index < 0)
      {
        if (route.data)
        {
          const expectedRole = route.data.exceptionRole;
          const userRole = this.frontEndService.getJWTUserIdentity().loginRoleName;
          if (expectedRole.indexOf(userRole) >= 0)
          {
              index = 1;
          }
        }
      }
      if (!this.authenticationService.isAuthenticated() || index < 0 )
      {
        this.authenticationService.logout();
        this.router.navigate(['/login']);
        return false;
      }
      return true;
    }
}
