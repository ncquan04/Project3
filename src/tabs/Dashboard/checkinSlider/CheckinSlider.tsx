import { Dimensions, EventSubscription, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import SwipeButton from 'rn-swipe-button';
import { THEME_COLOR } from '../../../theme';
import RightArrowIcon from '../../../icons/RightArrowIcon';
import {
  discoverAndSendCheckin,
  discoverAttendanceSessions,
  getStudentClasses,
  startAttendanceSession,
} from '../../../utils';
import { useAuth } from '../../../contexts/AuthContext';

const CheckinSlider = () => {
  const { user, role } = useAuth();

  const handleSwipeSuccess = async () => {
    if (user?.email === 'chiquan02122004@gmail.com') {
      getStudentClasses('IVhkIwf7M2PrY7hX0fJ1Z01NoMl1').then(async classes => {
        if (classes.length > 0) {
          await startAttendanceSession(classes[0]);
        }
      });
    } else if (user?.email === 'chiquannguyen363@gmail.com') {
      getStudentClasses('IVhkIwf7M2PrY7hX0fJ1Z01NoMl1').then(async classes => {
        if (classes.length > 0) {
          await discoverAndSendCheckin(classes[0], user.uid);
        }
      });
    }
  };

  return (
    <LinearGradient
      colors={['transparent', '#FFFFFFCC', '#FFFFFF']}
      style={{
        position: 'absolute',
        bottom: 0,
        width: Dimensions.get('window').width,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 24,
      }}
    >
      <SwipeButton
        titleColor={THEME_COLOR.white}
        railBackgroundColor={THEME_COLOR.primary + 'AA'}
        railFillBackgroundColor={THEME_COLOR.primary}
        railFillBorderColor="transparent"
        railBorderColor="transparent"
        thumbIconBorderColor={THEME_COLOR.primary}
        title="Swipe to Check In"
        thumbIconBackgroundColor={THEME_COLOR.white}
        thumbIconComponent={() => (
          <RightArrowIcon width={20} height={20} fill={THEME_COLOR.primary} />
        )}
        thumbIconStyles={{
          borderRadius: 16,
        }}
        containerStyles={{
          width: '100%',
          borderRadius: 16,
        }}
        railStyles={{
          borderRadius: 16,
        }}
        onSwipeSuccess={handleSwipeSuccess}
      />
    </LinearGradient>
  );
};

export default CheckinSlider;
