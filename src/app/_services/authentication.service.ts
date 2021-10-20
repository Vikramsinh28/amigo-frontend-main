import { environment } from './../../environments/environment.prod';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BackendService } from '../backend';
import { FrontendService } from './frontend.service';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({ providedIn: 'root' })

export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<any>;
    public currentUser: Observable<any>;
    private refreshTokenTimeout: any;
    public jwtHelper =  new JwtHelperService();
    constructor(private http: HttpClient,
        private backendService: BackendService,
        private fronendService: FrontendService,
        ) {
        this.currentUserSubject = new BehaviorSubject<any>(this.fronendService.getUser());
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get getrefreshTokenTimeout()
    {
        return this.refreshTokenTimeout;
    }

    public get currentUserValue() {
        return this.currentUserSubject.value;
    }

    public IsTimerAlive() : Boolean
    {
        if (this.refreshTokenTimeout)
            return true;
        else return false;
    }

    public login(clientInternalName : String, username : String, password: String) {
        return this.backendService.login(clientInternalName, username, password)
            .pipe(map(user => {
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    this.currentUserSubject.next(user);
                    //this.startRefreshTokenTimer();
                    return user;
                },
                (error: any) => {
                    return error;
                }

            ));
    }

    public logout() {
        // remove user from local storage and set current user to null
        localStorage.removeItem('currentUser');
        localStorage.removeItem('menu');
        localStorage.removeItem('clientLogo');
        localStorage.removeItem('aRoutes');
        this.currentUserSubject.next(null);
    }

    private saveUserToLs(value: any)
    {
        localStorage.setItem("currentUser", value);
    }

    public refreshToken() {
        //console.log('refreshToken fired!! --> ',new Date(Date.now()).toDateString() );
        return this.backendService.RefreshToken()
            .pipe(map((response: any) => {
                let user = this.fronendService.getUser();
                user.access_token = response.access_token;
                this.saveUserToLs(JSON.stringify(user));
                //this.currentUserSubject.next(user);
                this.startRefreshTokenTimer();
                return user.access_token;
            }));
    }

    public startRefreshTokenTimer() {
        let beforeExpiry = environment.beforeExpiry;
        let refreshTokenTimeout = this.fronendService.getJWTUserIdentity().expiryDuration;
        // set a timeout to refresh the token a minute before it expires
        let expires = new Date(Date.now() + (refreshTokenTimeout))
        let timeout = expires.getTime() - Date.now() - (beforeExpiry * 60 * 1000);
        this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(), timeout);
    }

    public stopRefreshTokenTimer() {
        clearTimeout(this.refreshTokenTimeout);
    }

    public isAuthenticated(): boolean {
        let user = this.fronendService.getUser();
        if (!user) return false;

        const token = user.access_token;
        // Check whether the token is expired and return
        // true or false
        return !this.jwtHelper.isTokenExpired(token);
      }

}