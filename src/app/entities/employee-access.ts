export interface EmployeeAccess
{
    employeeAccessId? : number,
    employeeId? : number,
    grade? : string,
    gradeId? : number,
    division? : string,
    gradeDivisionId? : number,
    subject ?: string,
    subjectId ?: number
}

export interface EmployeeAccessSearch {
    firstName?           : string,
    lastName?            : string,
    name?                : string,
    roleName?            : string,
    userRoleId?          : number,
    employeeId?          : number,
    clientEmployeeNo?    : string,
    clientYearId?        : number,
    yearLabel?           : string,
    employeeAccess?      : EmployeeAccess[],
    employeeAccessDisplay?: any
}

export enum userRole
{
    SuperAdmin = 0,
    Admin = 1,
    Teacher = 2,
    Student = 3,
    Management = 4,
    Subject_Supervisor = 5
}