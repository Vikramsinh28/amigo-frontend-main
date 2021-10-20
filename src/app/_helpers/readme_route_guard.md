Angular Route Guards allow you to restrict access to certain routes based on custom rules/conditions. The below route guard (AuthGuard) prevents unauthenticated users from accessing a route by implementing the CanActivate interface and defining custom rules in the canActivate() method.

When the AuthGuard is attached to a route, the canActivate() method is called by Angular to determine if the route can be "activated". If the user is logged in and the canActivate() method returns true then navigation is allowed to continue, otherwise the method returns false and navigation is cancelled.

The canActivate() method:

* specifies the parameters (route: ActivatedRouteSnapshot, state: RouterStateSnapshot), these are required to implement the CanActivate interface.
* gets the value of the current user by accessing the authenticationService.currentUserValue property.
* returns true if the currentUser contains a value, meaning that the user is logged in.
* calls this.router.navigate() to navigate to the /login route if the user is not logged in, passing the returnUrl as a query parameter so the user can be redirected back to their original requested page after logging in.
* returns false if the user is not logged in to cancel navigation to the current route.


Add Auth Guard to Home Page Route:

To control access to a route with the auth guard you add it to the canActivate array in the route's configuration. The route guards in the canActivate array are run by Angular to decide if the route can be "activated", if all of the route guards return true navigation is allowed to continue, but if any of them return false navigation is cancelled.