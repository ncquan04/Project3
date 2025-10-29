import { Text, View } from 'react-native';
import { navigationRef } from '../../../navigation';
import { THEME_COLOR } from '../../../theme';
import AppText from '../../../components/appText/AppText';

const LoginHeader = () => {
  const onPressSignUp = () => {
    navigationRef.navigate('Register');
  };

  return (
    <View style={{ gap: 8, alignItems: 'center' }}>
      <AppText
        style={{ fontSize: 24, fontWeight: 'bold', color: THEME_COLOR.black }}
      >
        Login
      </AppText>
      <AppText>
        <AppText
          style={{
            fontSize: 14,
            fontWeight: 'medium',
            color: THEME_COLOR.black,
          }}
        >
          {`Does not have an account? `}
        </AppText>
        <AppText
          style={{
            fontSize: 14,
            fontWeight: 'medium',
            textDecorationLine: 'underline',
            color: THEME_COLOR.primaryBlue,
          }}
          onPress={onPressSignUp}
        >
          Sign up
        </AppText>
      </AppText>
    </View>
  );
};

export default LoginHeader;
