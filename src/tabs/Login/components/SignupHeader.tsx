import { Text, TouchableOpacity, View } from 'react-native';
import { THEME_COLOR } from '../../../constants';
import { navigationRef } from '../../../navigation';
import BackArrowIcon from '../../../icons/BackArrowIcon';

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
      <Text
        style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: THEME_COLOR.black,
        }}
      >
        Sign Up
      </Text>
      <Text>
        <Text
          style={{
            fontSize: 14,
            fontWeight: 'medium',
            color: THEME_COLOR.black,
          }}
        >
          {`Already have an account? `}
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontWeight: 'medium',
            textDecorationLine: 'underline',
            color: THEME_COLOR.primaryBlue,
          }}
          onPress={onPressSignIn}
        >
          Sign in
        </Text>
      </Text>
    </View>
  );
};

export default SignupHeader;
