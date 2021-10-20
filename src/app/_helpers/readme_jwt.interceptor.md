Angular HTTP Interceptors allow you to intercept HTTP requests from your Angular app before they are sent to the backend, they can be used to modify requests before they are sent as well as handle responses.

HTTP Interceptors implement an intercept() method which is called for all requests and receives two parameters: the current request and the next handler in the chain. Multiple interceptors can be registered to handle requests, interceptors are registered in the providers section of the Angular module which we'll do shortly. An interceptor can return a response directly when it's done or pass control to the next handler in the chain by calling next.handle(request). The last handler in the chain is the built in Angular HttpBackend which sends the request via the browser to the backend. For more information on Angular HTTP Interceptors see https://angular.io/api/common/http/HttpInterceptor or this article.

The JWT Interceptor adds an HTTP Authorization header with a JWT token to the headers of all requests for authenticated users.

The constructor() method specifies the AuthenticationService as a dependency which is automatically injected by the Angular Dependency Injection (DI) system.

The intercept() method:

* checks if the user is logged in by checking the authenticationService.currentUserValue exists and has a token property.
* clones the request and adds the Authorization header with the current user's JWT token with the 'Bearer ' prefix to indicate that it's a bearer token (required for JWT). The request object is immutable so it is cloned to add the auth header.
* passes the request to the next handler in the chain by calling next.handle(request).