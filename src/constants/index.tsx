import { Class, UserRole } from '../types';

export const SAMPLE_CLASS: Class = {
  id: '123456',
  semester: '20251',
  subjectCode: 'CS101',
  subjectName: 'Introduction to Computer Science',
  schedule: {
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '10:30',
    weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  },
  teacher: {
    teacherId: 'T001',
    name: 'Dr. John Doe',
    role: UserRole.Teacher,
    email: '',
  },
};
