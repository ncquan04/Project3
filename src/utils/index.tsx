import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import { Class, Student } from '../types';
import NativeRTNAttendance from '../../specs/NativeRTNAttendance';

export const getStudentClasses = async (studentId: string) => {
  try {
    const db = getFirestore();
    const studentRef = doc(db, 'students', studentId);

    const q = query(
      collection(db, 'enrollments'),
      where('student', '==', studentRef),
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) return [];

    const classRefs = snapshot.docs.map(
      doc => doc.data().class as FirebaseFirestoreTypes.DocumentReference,
    );

    // Filter out invalid refs if any
    const validClassRefs = classRefs.filter(
      (ref): ref is FirebaseFirestoreTypes.DocumentReference => !!ref,
    );

    const classDocs = await Promise.all(validClassRefs.map(ref => getDoc(ref)));

    const classes = await Promise.all(
      classDocs
        .filter((docSnap): docSnap is FirebaseFirestoreTypes.DocumentSnapshot =>
          docSnap.exists(),
        )
        .map(async docSnap => {
          const classData = docSnap.data();
          if (!classData) return null;

          const teacherRef = classData.teacherId;
          let teacherData = null;

          if (teacherRef) {
            // Handle both Reference and String ID
            let teacherSnap: FirebaseFirestoreTypes.DocumentSnapshot;
            if (typeof teacherRef === 'string') {
              teacherSnap = await getDoc(doc(db, 'teachers', teacherRef));
            } else {
              // Assuming it's a DocumentReference
              teacherSnap = await getDoc(
                teacherRef as FirebaseFirestoreTypes.DocumentReference,
              );
            }

            if (teacherSnap && teacherSnap.exists()) {
              const tData = teacherSnap.data();
              if (tData) {
                teacherData = { id: teacherSnap.id, ...tData };
              }
            }
          }

          return {
            id: docSnap.id,
            ...classData,
            teacher: teacherData,
          } as Class;
        }),
    );

    return classes.filter((c): c is Class => c !== null);
  } catch (error) {
    console.error('Error getting student classes:', error);
    return [];
  }
};

export const getTeacherClasses = async (
  teacherIdentifier: string | FirebaseFirestoreTypes.DocumentReference,
) => {
  try {
    const db = getFirestore();
    let teacherRef: FirebaseFirestoreTypes.DocumentReference;

    if (typeof teacherIdentifier === 'string') {
      teacherRef = doc(db, 'teachers', teacherIdentifier);
    } else {
      teacherRef = teacherIdentifier;
    }

    const [snapshot, teacherSnap] = await Promise.all([
      getDocs(
        query(collection(db, 'classes'), where('teacherId', '==', teacherRef)),
      ),
      getDoc(teacherRef),
    ]);

    const teacherData = teacherSnap.exists()
      ? { id: teacherSnap.id, ...teacherSnap.data() }
      : null;

    const classes = snapshot.docs.map(
      (docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
        id: docSnap.id,
        ...docSnap.data(),
        teacher: teacherData,
      }),
    ) as Class[];

    return classes;
  } catch (error) {
    console.error('Error getting teacher classes:', error);
    return [];
  }
};

export const getCurrentClass = async (studentId: string) => {
  try {
    const classes = await getStudentClasses(studentId);
    const now = new Date();
    const currentDay = now.getDay() + 1;
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const currentClass = classes.find((cls: Class) => {
      if (!cls.schedule) return false;
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
  } catch (error) {
    console.error('Error getting current class:', error);
    return undefined;
  }
};

export const startAttendanceSession = async (cls: Class) => {
  try {
    NativeRTNAttendance.setSessionSecret(cls.id);
    const serverInfo = await NativeRTNAttendance.startServer();
    console.log('Server started:', serverInfo);
    const serviceInfo = await NativeRTNAttendance.registerService();
    console.log('Service registered:', serviceInfo);
    return { serverInfo, serviceInfo };
  } catch (error) {
    console.error('Failed to start session:', error);
    throw error;
  }
};

export const discoverAttendanceSessions = async () => {
  try {
    console.log('Starting discovery...');
    await NativeRTNAttendance.findService(10000);
    console.log('Discovery finished');
  } catch (error) {
    console.error('Discovery failed:', error);
  }
};

export const discoverAndSendCheckin = async (cls: Class, studentId: string) => {
  try {
    console.log('Starting discovery...');
    const service = await NativeRTNAttendance.findService(10000);
    console.log('Service found:', service);

    await NativeRTNAttendance.resolveAndConnect(service.serviceName);
    const payload = `AUTH:${cls.id}:${studentId}`;
    const res = await NativeRTNAttendance.sendCheckin(payload);
    console.log('Check-in payload sent successfully:', res);
  } catch (error) {
    console.error('Check-in failed:', error);
  }
};

export const getStudentProfile = async (studentId: string) => {
  try {
    const db = getFirestore();
    const snapshot = await getDoc(doc(db, 'students', studentId));
    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...(snapshot.data() as Student),
    };
  } catch (error) {
    console.error('Error fetching student profile:', error);
    return null;
  }
};
