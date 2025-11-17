export enum UserRole {
  Student = 'student',
  Teacher = 'teacher',
  Admin = 'admin',
}

export enum Gender {
  Male = 1,
  Female = 2,
}

export type Schedule = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  weeks: number[];
};

export type Student = {
  studentId: string;
  name: string;
  email: string;
  gender: Gender;
  major: string;
  role: UserRole;
  year: number;
};

export type Teacher = {
  teacherId: string;
  name: string;
  role: UserRole;
  email: string;
};

export type Class = {
  id: string;
  semester: string;
  subjectCode: string;
  subjectName: string;
  schedule: Schedule;
  teacher: Teacher;
};
