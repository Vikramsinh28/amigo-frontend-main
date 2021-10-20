import { Int } from '@bokeh/bokehjs/build/js/types/core/properties';

export interface User{
    userId?             : number;
    userType?           : number;
    userName?           : string;
    activeState?        : number;
    userRoleId?         : number;
    clientRoleId?       : number;
    roleId?             : number;
    roleName?           : string;

}