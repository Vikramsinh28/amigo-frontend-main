import { Injectable } from '@angular/core';
import jwt_decode from "jwt-decode";

@Injectable({
    providedIn: 'root'
})
export class FrontendService {

    getUser() {
        return JSON.parse(localStorage.getItem('currentUser'));
    }

    getJWAccessToken() {
        var user = this.getUser()
        if (user)
            return jwt_decode(user.access_token)
        else return '';
    }

    getJWTUserIdentity() {
        var jwt: any = this.getJWAccessToken()
        return jwt.identity;
    }

    getJWTUserIdentity4CurrUser(currentUser) {
        var jwt: any = jwt_decode(currentUser.access_token)
        return jwt.identity;
    }
    getClientLogo()
    {
        var clientLogo;
        clientLogo=localStorage.getItem('clientLogo');
        if (clientLogo != null) {
            clientLogo=JSON.parse(clientLogo);
            clientLogo=clientLogo.changingThisBreaksApplicationSecurity;
            return clientLogo;
        } else {
            return null;
        }
    }
    getMenu()
    {
        return JSON.parse(localStorage.getItem('menu'));
    }
    getUserPicture()
    {
        var user = this.getUser()
        if (user)
            return user.picture
        else return '';
    }
    setAvailableRoutes()
    {
        let menu = this.getMenu();
        let availableRoutes = [];

        menu.forEach(element => {
            availableRoutes = this.iterateMenu(element, availableRoutes)
        });
        localStorage.setItem('aRoutes', availableRoutes.join(", "));
    }
    iterateMenu(element, aRoutes)
    {
        if (element.type == 'LEAF' && element.route)
        {
            element.route = element.route.split("/")[0];
                if (aRoutes.indexOf(element.route) < 0)
                    aRoutes.push(element.route);
        }
        else if (element.type != 'LEAF')
        {
            if (element.children)
            {
                element.children.forEach(child => {
                    aRoutes = this.iterateMenu(child, aRoutes);
                });
            }
        }
        return aRoutes;

    }
    getAvailableRoutes()
    {
        return localStorage.getItem('aRoutes');
    }
}