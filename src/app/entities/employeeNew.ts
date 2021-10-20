import { AuditingFields } from './auditingFields';
import { User } from './user';

export interface Employee{

    employeeId?          : number;
    clientId?            : number;
    employeeNo?          : number;
    clientRoleId?        : number; //clientRoleId which is assigned to this employee user
    title?               : string;
    firstName?           : string;
    middleName?          : string;
    lastName?            : string;
    gender?              : string  & { length: 1 };
    birthDate?           : Date;
    email?               : string;
    user?                : User;
    auditingFields?      : AuditingFields;
}