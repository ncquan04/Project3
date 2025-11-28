import { View } from 'react-native';
import { Class } from '../../../types';
import ClassItem from './ClassItem';
import AppText from '../../../components/appText/AppText';

interface TodayClassesProps {
  today: Date;
  userClasses: Class[];
}

const TodayClasses = (props: TodayClassesProps) => {
  const beginSemesterDay = new Date('2025-09-07T00:00:00');

  const currentWeekNumber =
    Math.floor(
      (props.today.getTime() - beginSemesterDay.getTime()) /
        (7 * 24 * 60 * 60 * 1000),
    ) + 1;

  const todayClasses = props.userClasses
    .filter(cls => {
      return (
        cls.schedule.weeks.includes(currentWeekNumber) &&
        cls.schedule.dayOfWeek === props.today.getDay() + 1
      );
    })
    .sort((a, b) => {
      return a.schedule.startTime.localeCompare(b.schedule.startTime);
    });

  return (
    <View
      style={{
        flex: 1,
        width: '100%',
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 16,
      }}
    >
      {todayClasses.map(cls => (
        <ClassItem key={cls.id} cls={cls} />
      ))}
      {todayClasses.length === 0 && (
        <View
          style={{
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 32,
          }}
        >
          <AppText style={{ fontSize: 16, color: '#666666' }}>
            No classes scheduled for today.
          </AppText>
        </View>
      )}
    </View>
  );
};

export default TodayClasses;
