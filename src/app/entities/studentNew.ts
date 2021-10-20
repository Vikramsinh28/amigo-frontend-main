import { ClientYear } from './clientYear';
import { User } from './user';

export interface StudentNew extends ClientYear {
    studentId?: number;
    clientId?: number;
    regNo?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    gender?: string & { length: 1 };
    birthDate?: Date;
    aboutMe?: string;
    profileSummary?: string;
    user?: User;
    division?: any;
    academicYear?: any;
    gradeId?: any;
    gradeDivisionId?: any;
    yearId?: any;


}