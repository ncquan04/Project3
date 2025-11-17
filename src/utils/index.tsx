import firestore from '@react-native-firebase/firestore';
import { Class } from '../types';

export const getStudentClasses = async (studentId: string) => {
  const db = firestore();
  const studentRef = db.doc(`students/${studentId}`);

  const snapshot = await db
    .collection('enrollments')
    .where('student', '==', studentRef)
    .get();

  if (snapshot.empty) return [];

  const classRefs = snapshot.docs.map(doc => doc.data().class);

  const classDocs = await Promise.all(classRefs.map(ref => ref.get()));

  const classes = await Promise.all(
    classDocs
      .filter(doc => doc.exists)
      .map(async doc => {
        const classData = doc.data();
        const teacherRef = classData.teacherId;

        let teacherData = null;
        if (teacherRef) {
          const teacherSnap = await teacherRef.get();
          if (teacherSnap.exists) {
            teacherData = { id: teacherSnap.id, ...teacherSnap.data() };
          }
        }

        return {
          id: doc.id,
          ...classData,
          teacher: teacherData,
        } as Class;
      }),
  );

  return classes;
};

const getCurrentClass = async (studentId: string) => {
  const classes = await getStudentClasses(studentId);
  const now = new Date();
  const currentDay = now.getDay() + 1;
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const currentClass = classes.find(cls => {
    if (cls.schedule.dayOfWeek !== currentDay) return false;
    const [startHour, startMinute] = cls.schedule.startTime
      .split(':')
      .map(Number);
    const [endHour, endMinute] = cls.schedule.endTime.split(':').map(Number);
    const classStartTime = startHour * 60 + startMinute;
    const classEndTime = endHour * 60 + endMinute;
    return currentTime >= classStartTime && currentTime <= classEndTime;
  });
  return currentClass;
};
