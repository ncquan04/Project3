import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import UserInfoCard from '../../components/userInfoCard/UserInfoCard';
import { THEME_COLOR } from '../../theme';
import WeekDays from './components/WeekDays';
import CheckinSlider from './checkinSlider/CheckinSlider';
import { getStudentClasses, getTeacherClasses } from '../../utils';
import { useAuth } from '../../contexts/AuthContext';
import TodayClasses from './components/TodayClasses';
import { Class, UserRole } from '../../types';

const DashboardTab = () => {
  const { user, role } = useAuth();
  const [day, setDay] = useState<Date>(new Date());
  const [classes, setClasses] = useState<Class[]>([]);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (role === UserRole.Teacher) {
      getTeacherClasses(user.uid).then(setClasses);
    } else {
      getStudentClasses(user.uid).then(setClasses);
    }
  }, [user, role]);

  return (
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
      <CheckinSlider />
    </View>
  );
};

export default DashboardTab;
