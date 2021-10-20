import { AuditingFields } from './auditingFields';

export interface ClientRoleEntity {
    clientRoleId?          : number;
    clientId?              : number;
    roleId?                : number;
    roleName?              : String;
    auditingFields?        : AuditingFields;
}
