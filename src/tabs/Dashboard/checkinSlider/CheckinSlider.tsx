import { Dimensions, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import SwipeButton from 'rn-swipe-button';
import { THEME_COLOR } from '../../../theme';
import RightArrowIcon from '../../../icons/RightArrowIcon';

type CheckinSliderProps = {
  onSwipeSuccess?: () => void;
  label?: string;
};

const CheckinSlider = ({ onSwipeSuccess, label }: CheckinSliderProps) => {
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
        title={label ?? 'Swipe to Check In'}
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
        onSwipeSuccess={onSwipeSuccess}
      />
    </LinearGradient>
  );
};

export default CheckinSlider;
