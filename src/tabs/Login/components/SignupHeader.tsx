import { Text, TouchableOpacity, View } from 'react-native';
import { navigationRef } from '../../../navigation';
import BackArrowIcon from '../../../icons/BackArrowIcon';
import { THEME_COLOR } from '../../../theme';
import AppText from '../../../components/appText/AppText';

const SignupHeader = () => {
  const onPressSignIn = () => {
    navigationRef.navigate('Login');
  };

  const handleBack = () => {
    navigationRef.goBack();
  };

  return (
    <View
      style={{
        gap: 8,
        alignItems: 'flex-start',
        width: '100%',
        padding: 8,
      }}
    >
      <TouchableOpacity style={{ padding: 4, left: -12 }} onPress={handleBack}>
        <BackArrowIcon width={16} height={16} />
      </TouchableOpacity>
      <AppText
        style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: THEME_COLOR.black,
        }}
      >
        Sign Up
      </AppText>
      <AppText>
        <AppText
          style={{
            fontSize: 14,
            fontWeight: 'medium',
            color: THEME_COLOR.black,
          }}
        >
          {`Already have an account? `}
        </AppText>
        <AppText
          style={{
            fontSize: 14,
            fontWeight: 'medium',
            textDecorationLine: 'underline',
            color: THEME_COLOR.primaryBlue,
          }}
          onPress={onPressSignIn}
        >
          Sign in
        </AppText>
      </AppText>
    </View>
  );
};

export default SignupHeader;
