export type StudentCheckinStep = 'discovering' | 'connecting' | 'sending';

export type StudentCheckinPhase =
  | 'idle'
  | 'discovering'
  | 'connecting'
  | 'sending'
  | 'success'
  | 'error';

export type StudentCheckinState = {
  phase: StudentCheckinPhase;
  currentStep?: StudentCheckinStep;
  message?: string;
  error?: string;
  receiptId?: string;
};

export type TeacherSessionPhase =
  | 'idle'
  | 'starting'
  | 'registering'
  | 'waiting'
  | 'error';

export type TeacherAttendee = {
  studentId: string;
  name?: string;
  checkedInAt: number;
};

export type TeacherSessionState = {
  phase: TeacherSessionPhase;
  message?: string;
  attendees: TeacherAttendee[];
  error?: string;
};
