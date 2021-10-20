import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthenticationService } from '../_services';
import { FrontendService } from '../_services/frontend.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private frontendService: FrontendService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // add authorization header with jwt token if available
        let currentUser = this.frontendService.getUser();
        if (currentUser && currentUser.access_token && currentUser.refresh_token) {
            if (request.url.includes("refresh"))
            {
                request = request.clone({
                    setHeaders: {
                        Aikwarium: `SPSAuth ${currentUser.refresh_token}`
                    }
                });
            }
            else
            {
                request = request.clone({
                    setHeaders: {
                        Aikwarium: `SPSAuth ${currentUser.access_token}`
                    }
                });
            }
        }
        //console.log('JwtInterceptor --> ' , request)
        return next.handle(request);
    }
}