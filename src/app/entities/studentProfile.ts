export interface AccomplishmentShort {
    title : string,
    desc  : string
  }
  export interface YearlyAccomplishments {
    year: string;
    records : AccomplishmentShort[]
  }

  export interface Skill {
    id   : number;
    name : string;
  }

  export interface Interest {
    id   : number;
    name : string;
  }
export interface StudentProfile {
    first_name?      : string,
    last_name?       : string,
    about_me?        : string,
    academicYear?    : number,
    profile_summary? : string;
    city?            : string;
    state?           : string;
    country?         : string;
    email?           : string;
    phone?           : string,
    top2Accomplishments? : YearlyAccomplishments;
    skills?          : Skill[];
    interests?       : Interest[];
    picture?         : string;
}