export interface SNY {
    left?: SNYGradeList,
    right?: SNYGradeList,
    futureYearPresent?: boolean,
}

export interface SNYGradeList {
    grades?: SNYGrade[],
    yrLabel: string,
    clientYrId: number,
    currentAcademicYear?: boolean
}

export interface SNYGrade {
    grade?: string,
    gradeId: number,
    totalCnt: number,
    promotedCnt: number,
    lcCnt: number,
    inSession: boolean
}