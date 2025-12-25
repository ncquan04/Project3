import {
  View,
  ScrollView,
  DeviceEventEmitter,
  EmitterSubscription,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getFirestore, doc, setDoc } from '@react-native-firebase/firestore';
import UserInfoCard from '../../components/userInfoCard/UserInfoCard';
import { THEME_COLOR } from '../../theme';
import WeekDays from './components/WeekDays';
import CheckinSlider from './checkinSlider/CheckinSlider';
import {
  getStudentClasses,
  getTeacherClasses,
  getStudentProfile,
} from '../../utils';
import { useAuth } from '../../contexts/AuthContext';
import TodayClasses from './components/TodayClasses';
import { Class, UserRole } from '../../types';
import BaseModal, {
  BaseModalRefType,
} from '../../components/baseModal/BaseModal';
import CheckinModal from './components/CheckinModal';
import NativeRTNAttendance from '../../../specs/NativeRTNAttendance';
import { StudentCheckinState, TeacherSessionState } from './types';
import { SAMPLE_CLASS } from '../../constants';

const createInitialStudentState = (): StudentCheckinState => ({
  phase: 'idle',
});

const createInitialTeacherState = (): TeacherSessionState => ({
  phase: 'idle',
  attendees: [],
});

const DashboardTab = () => {
  const { user, role } = useAuth();
  const [day, setDay] = useState<Date>(new Date());
  const [classes, setClasses] = useState<Class[]>([]);
  const [modalMode, setModalMode] = useState<'student' | 'teacher' | null>(
    null,
  );
  const [activeClass, setActiveClass] = useState<Class | null>(null);
  const [studentState, setStudentState] = useState<StudentCheckinState>(() =>
    createInitialStudentState(),
  );
  const [teacherState, setTeacherState] = useState<TeacherSessionState>(() =>
    createInitialTeacherState(),
  );

  const { studentInfo, teacherInfo } = useAuth();

  const checkinModalRef = useRef<BaseModalRefType>(null);
  const teacherListenerRef = useRef<EmitterSubscription | null>(null);
  const studentNameCache = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!user) {
      return;
    }

    if (user.email === 'chiquannguyen363@gmail.com') {
      getStudentClasses(user.uid).then(classes => {
        setClasses(classes);
      });
    }
    if (role === UserRole.Teacher) {
      getTeacherClasses(user.uid).then(setClasses);
    } else {
      getStudentClasses(user.uid).then(setClasses);
    }
  }, [user, role]);

  useEffect(() => {
    return () => {
      teacherListenerRef.current?.remove();
    };
  }, []);

  const findOngoingClass = useCallback(() => {
    const now = new Date();
    const currentDay = now.getDay() + 1;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return (
      classes.find(currentClass => {
        const schedule = currentClass.schedule;
        if (!schedule) {
          return false;
        }

        if (schedule.dayOfWeek !== currentDay) {
          return false;
        }

        const [startHour, startMinute] = schedule.startTime
          .split(':')
          .map(Number);
        const [endHour, endMinute] = schedule.endTime.split(':').map(Number);
        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;

        return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
      }) ?? null
    );
  }, [classes]);

  const stopTeacherSession = useCallback(async () => {
    teacherListenerRef.current?.remove();
    teacherListenerRef.current = null;
    studentNameCache.current = {};

    try {
      await NativeRTNAttendance.unregisterService();
    } catch (error) {
      console.warn('Failed to unregister service', error);
    }

    try {
      await NativeRTNAttendance.stopServer();
    } catch (error) {
      console.warn('Failed to stop server', error);
    }
  }, []);

  const ensureTeacherListener = useCallback((classId: string) => {
    teacherListenerRef.current?.remove();
    teacherListenerRef.current = DeviceEventEmitter.addListener(
      'attendance_checkin',
      payload => {
        if (!payload || payload.classId !== classId) {
          return;
        }

        const studentId = payload.studentId as string;
        if (!studentId) {
          return;
        }

        const timestamp =
          typeof payload.timestamp === 'number'
            ? payload.timestamp
            : Date.now();

        setTeacherState(prev => {
          if (prev.attendees.some(att => att.studentId === studentId)) {
            return prev;
          }

          return {
            ...prev,
            attendees: [
              {
                studentId,
                name: studentNameCache.current[studentId],
                checkedInAt: timestamp,
              },
              ...prev.attendees,
            ],
          };
        });

        if (!studentNameCache.current[studentId]) {
          getStudentProfile(studentId).then(profile => {
            if (!profile?.name) {
              return;
            }

            studentNameCache.current[studentId] = profile.name;
            setTeacherState(prev => ({
              ...prev,
              attendees: prev.attendees.map(att =>
                att.studentId === studentId
                  ? { ...att, name: profile.name }
                  : att,
              ),
            }));
          });
        }
      },
    );
  }, []);

  const startStudentCheckin = useCallback(
    async (targetClass: Class) => {
      if (!user) {
        return;
      }

      try {
        setStudentState({
          phase: 'discovering',
          currentStep: 'discovering',
          message: 'Đang tìm máy chủ điểm danh gần bạn...',
        });
        const service = await NativeRTNAttendance.findService(10000);

        setStudentState({
          phase: 'connecting',
          currentStep: 'connecting',
          message: 'Đang kết nối với phiên điểm danh...',
        });
        await NativeRTNAttendance.resolveAndConnect(service.serviceName);

        setStudentState({
          phase: 'sending',
          currentStep: 'sending',
          message: 'Đang gửi yêu cầu điểm danh...',
        });
        const payload = `AUTH:${targetClass.id}:${studentInfo?.studentId}`;
        const ack = await NativeRTNAttendance.sendCheckin(payload);

        if (ack.status === 'ok') {
          try {
            const db = getFirestore();

            const checkedInAt = Date.now();
            const receiptId =
              typeof ack.receiptId === 'string' ? ack.receiptId.trim() : '';

            const attendanceId = receiptId || `${user.uid}_${checkedInAt}`;
            const attendanceDocRef = doc(db, 'attendances', attendanceId);

            await setDoc(
              attendanceDocRef,
              {
                id: attendanceId,
                receiptId: receiptId || null,
                classId: targetClass.id,
                studentId: studentInfo?.studentId ?? null,
                checkedInAt,
              },
              { merge: true },
            );
          } catch (firestoreError) {
            console.warn(
              'Failed to write attendance to Firestore',
              firestoreError,
            );
          }

          setStudentState({
            phase: 'success',
            currentStep: 'sending',
            message: 'Điểm danh thành công!',
            receiptId: ack.receiptId,
          });
        } else {
          const failureMessage = ack.message ?? 'Không thể ghi nhận điểm danh.';
          setStudentState({
            phase: 'error',
            currentStep: 'sending',
            message: failureMessage,
            error: failureMessage,
          });
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Không thể hoàn tất điểm danh.';
        setStudentState(prev => ({
          ...prev,
          phase: 'error',
          message,
          error: message,
        }));
      } finally {
        try {
          await NativeRTNAttendance.disconnect();
        } catch (disconnectError) {
          console.warn('Failed to disconnect after check-in', disconnectError);
        }
      }
    },
    [studentInfo, user],
  );

  const startTeacherSession = useCallback(
    async (targetClass: Class) => {
      setTeacherState({
        phase: 'starting',
        attendees: [],
        message: 'Đang khởi động phiên điểm danh...',
      });

      try {
        NativeRTNAttendance.setSessionSecret(targetClass.id);
        await NativeRTNAttendance.startServer();

        setTeacherState(prev => ({
          ...prev,
          phase: 'registering',
          message: 'Đang phát tín hiệu để sinh viên tìm thấy...',
        }));
        await NativeRTNAttendance.registerService();

        setTeacherState(prev => ({
          ...prev,
          phase: 'waiting',
          message: 'Sẵn sàng nhận điểm danh từ sinh viên.',
        }));
        ensureTeacherListener(targetClass.id);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Không thể khởi động phiên điểm danh.';
        setTeacherState({
          phase: 'error',
          attendees: [],
          message,
          error: message,
        });
        await stopTeacherSession();
      }
    },
    [ensureTeacherListener, stopTeacherSession],
  );

  const resetModalState = useCallback(() => {
    setModalMode(null);
    setActiveClass(null);
    setStudentState(createInitialStudentState());
    setTeacherState(createInitialTeacherState());
    studentNameCache.current = {};
  }, []);

  const cleanupModal = useCallback(async () => {
    if (modalMode === 'teacher') {
      await stopTeacherSession();
    } else if (modalMode === 'student') {
      try {
        await NativeRTNAttendance.disconnect();
      } catch (error) {
        console.warn('Failed to disconnect when closing modal', error);
      }
    }

    checkinModalRef.current?.hide();
    resetModalState();
  }, [modalMode, resetModalState, stopTeacherSession]);

  const dismissModal = useCallback(() => {
    cleanupModal().catch(error => console.warn('Failed to close modal', error));
  }, [cleanupModal]);

  const handleSwipeSuccess = useCallback(() => {
    if (!user || !role) {
      return;
    }

    // const ongoingClass = findOngoingClass();
    const ongoingClass = SAMPLE_CLASS;
    setActiveClass(ongoingClass);

    const mode = role === UserRole.Teacher ? 'teacher' : 'student';
    setModalMode(mode);
    setStudentState(createInitialStudentState());
    setTeacherState(createInitialTeacherState());

    checkinModalRef.current?.show();

    if (!ongoingClass) {
      if (mode === 'student') {
        setStudentState({
          phase: 'error',
          message: 'Không có lớp học nào đang diễn ra để điểm danh.',
          error: 'Hãy kiểm tra lại lịch học của bạn.',
        });
      } else {
        setTeacherState({
          phase: 'error',
          attendees: [],
          message: 'Không tìm thấy lớp học đang diễn ra.',
          error: 'Hãy kiểm tra lại lịch giảng dạy của bạn.',
        });
      }
      return;
    }

    if (mode === 'student') {
      startStudentCheckin(ongoingClass);
    } else {
      startTeacherSession(ongoingClass);
    }
  }, [findOngoingClass, role, startStudentCheckin, startTeacherSession, user]);

  return (
    <>
      <View
        style={{
          flex: 1,
          width: '100%',
          backgroundColor: THEME_COLOR.white,
          paddingHorizontal: 16,
          paddingVertical: 16,
          gap: 16,
        }}
      >
        <UserInfoCard />
        <WeekDays day={day} setDay={setDay} />

        <ScrollView
          contentContainerStyle={{
            width: '100%',
            backgroundColor: THEME_COLOR.veryLightGrey + '88',
            borderRadius: 16,
            gap: 32,
          }}
        >
          <TodayClasses today={day} userClasses={classes} />
        </ScrollView>
        <CheckinSlider
          label="Trượt để điểm danh"
          onSwipeSuccess={handleSwipeSuccess}
        />
      </View>
      <BaseModal
        ref={checkinModalRef}
        animationType="fade"
        showCloseButton={false}
        onRequestClose={dismissModal}
      >
        <CheckinModal
          mode={modalMode}
          studentState={studentState}
          teacherState={teacherState}
          activeClass={activeClass}
          onDismiss={dismissModal}
        />
      </BaseModal>
    </>
  );
};

export default DashboardTab;
